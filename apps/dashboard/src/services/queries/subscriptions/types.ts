export type SubPlanName = "pro" | "plus";

export interface ISubscription {
  start_timestamp: string; // ! These will be strings that need to be converted to date
  end_timestamp: string; // ! These will be strings that need to be converted to date
  price_id: string;
  subscription_id: string;
  user_id: string;
  created_at: string; // ! These will be strings that need to be converted to date
  updated_at: string | null; // ! These will be strings that need to be converted to date
  has_cancelled: boolean; // ! If user has cancelled, this should not be shown on the UI, but should still take precedence in as far as allowing access is concerned
  // So the above should not be filtered out when subs are being filterred out on the BE and should not prevent the sub button for that price from being clicked
  plan_name: SubPlanName;
}

export interface SubscriptionsResponse {
  subscriptions: Array<{
    id: string;
    object: string;
    application: any;
    application_fee_percent: any;
    automatic_tax: {
      disabled_reason: any;
      enabled: boolean;
      liability: any;
    };
    billing_cycle_anchor: number;
    billing_cycle_anchor_config: any;
    billing_thresholds: any;
    cancel_at: any;
    cancel_at_period_end: boolean;
    canceled_at: any;
    cancellation_details: {
      comment: any;
      feedback: any;
      reason: any;
    };
    collection_method: string;
    created: number;
    currency: string;
    current_period_end: number;
    current_period_start: number;
    customer: string;
    days_until_due: any;
    default_payment_method: any;
    default_source: any;
    default_tax_rates: Array<any>;
    description: any;
    discount: any;
    discounts: Array<any>;
    ended_at: any;
    invoice_settings: {
      account_tax_ids: any;
      issuer: {
        type: string;
      };
    };
    items: {
      object: string;
      data: Array<{
        id: string;
        object: string;
        billing_thresholds: any;
        created: number;
        current_period_end: number;
        current_period_start: number;
        discounts: Array<any>;
        metadata: any;
        plan: {
          id: string;
          object: string;
          active: boolean;
          aggregate_usage: any;
          amount: number;
          amount_decimal: string;
          billing_scheme: string;
          created: number;
          currency: string;
          interval: string;
          interval_count: number;
          livemode: boolean;
          metadata: any;
          meter: any;
          nickname: any;
          product: string;
          tiers_mode: any;
          transform_usage: any;
          trial_period_days: any;
          usage_type: string;
        };
        price: {
          id: string;
          object: string;
          active: boolean;
          billing_scheme: string;
          created: number;
          currency: string;
          custom_unit_amount: any;
          livemode: boolean;
          lookup_key: any;
          metadata: any;
          nickname: any;
          product: string;
          recurring: {
            aggregate_usage: any;
            interval: string;
            interval_count: number;
            meter: any;
            trial_period_days: any;
            usage_type: string;
          };
          tax_behavior: string;
          tiers_mode: any;
          transform_quantity: any;
          type: string;
          unit_amount: number;
          unit_amount_decimal: string;
        };
        quantity: number;
        subscription: string;
        tax_rates: Array<any>;
      }>;
      has_more: boolean;
      total_count: number;
      url: string;
    };
    latest_invoice: string;
    livemode: boolean;
    metadata: any;
    next_pending_invoice_item_invoice: any;
    on_behalf_of: any;
    pause_collection: any;
    payment_settings: {
      payment_method_options: any;
      payment_method_types: any;
      save_default_payment_method: string;
    };
    pending_invoice_item_interval: any;
    pending_setup_intent: string;
    pending_update: any;
    plan: {
      id: string;
      object: string;
      active: boolean;
      aggregate_usage: any;
      amount: number;
      amount_decimal: string;
      billing_scheme: string;
      created: number;
      currency: string;
      interval: string;
      interval_count: number;
      livemode: boolean;
      metadata: any;
      meter: any;
      nickname: any;
      product: string;
      tiers_mode: any;
      transform_usage: any;
      trial_period_days: any;
      usage_type: string;
    };
    quantity: number;
    schedule: any;
    start_date: number;
    status: string;
    test_clock: any;
    transfer_data: any;
    trial_end: any;
    trial_settings: {
      end_behavior: {
        missing_payment_method: string;
      };
    };
    trial_start: any;
  }>;
  hasPlan: boolean;
  hasTrial: boolean;
}
