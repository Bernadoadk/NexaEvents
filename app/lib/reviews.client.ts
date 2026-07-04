type ReviewRequestResponse = {
  success: boolean;
  code: string;
  message: string;
};

type ShopifyReviewApi = {
  reviews?: {
    request?: () => Promise<ReviewRequestResponse>;
  };
};

declare global {
  interface Window {
    shopify?: ShopifyReviewApi;
  }
}

const LAST_REVIEW_REQUEST_KEY = "trackback:last-review-request-at";
const REVIEW_REQUEST_INTERVAL_MS = 1000 * 60 * 60 * 24 * 30;

export async function requestShopifyReviewAfterSuccessfulWorkflow() {
  if (typeof window === "undefined") return;

  try {
    const shopify = window.shopify;
    if (!shopify?.reviews?.request) return;

    const lastRequestAt = Number(window.localStorage.getItem(LAST_REVIEW_REQUEST_KEY) || 0);
    if (Date.now() - lastRequestAt < REVIEW_REQUEST_INTERVAL_MS) return;

    window.localStorage.setItem(LAST_REVIEW_REQUEST_KEY, String(Date.now()));

    const result = await shopify.reviews.request();
    if (!result.success) {
      console.info(
        `Review modal not displayed. Reason: ${result.code}: ${result.message}`,
      );
    }
  } catch (error) {
    console.info("Review request skipped.", error);
  }
}
