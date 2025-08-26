Feature: user-subscriptions

    # Tested
    Scenario: User first subscribes to Pro with available free trial
        Given the user has no active plan active
        And has free trial available
        When the user clicks on "Subscribe to Pro"
        And the user completes checkout
        Then the user should have access to the Pro features
        And the user should not be charged
        And the user should see that the subscription renews in less than 7 days

    # Tested
    Scenario: User first subscribes to Plus with available free trial
        Given the user has no active plan active
        And has free trial available
        When the user clicks on "Subscribe to Pro"
        And the user completes checkout
        # Intentionally PRO
        Then the user should have access to the Pro features
        And the user should not be charged
        And the user should see that the subscription renews in less than 7 days

    # Tested
    Scenario: User unsubscribes during the free trial period
        Given the user has subscribed to the Pro plan
        And is still in the Free Trial period
        When the user clicks unsubscribe
        Then the user should see that subscription ends in less than 7 days
        And the user should see "Unsubscribe" button on the Pro plan card

    # Tested
    Scenario: User subscribes to Pro without free trial
        Given the user has no active subscription
        And has no free trial available
        When the user subscribes to Pro
        Then the user should have access to the Pro features
        And the user should see that the subscription renews in more than 7 days

    # Tested
    Scenario: User subscribes to Plus without free trial
        Given the user has no active subscription
        And has no free trial available
        When the user subscribes to Plus
        Then the user should have access to the Plus features
        And the user should see that the subscription renews in more than 7 days

    # Tested
    Scenario: User resubscribes to the same plan
        Given the user has subscribed to the Pro plan
        And the user has unsubscribed from the Pro plan
        When the user clicks Resubscribe
        Then the user should see that subscription renews in some number of days

    # Tested
    Scenario: User resubscribes from Pro to Plus
        Given the user has subscribed to the "Pro" plan
        And the user has unsubscribed from the "Pro" plan
        When the user clicks "Subscribed to Plus"
        Then the user should see "Unsubscribe" on on the "Plus" plan card
        And they should see that the subscription renews for the amount the "Plus" plan costs

    # Tested
    Scenario: User resubscribes from Plus to Pro
        Given the user has subscribed to the "Plus" plan
        And the user has unsubscribed from the "Plus" plan
        When the user clicks "Subscribed to Pro"
        Then the user should see "Unsubscribe" on on the "Pro" plan card
        And they should see that the subscription renews for the amount the "Pro" plan costs

    # Tested
    Scenario: User switches from Pro to Plus plan
        Given the user has subscribed to the Pro plan
        And the user clicks "Switch to Plus"
        Then the user should see that the subscription renews in some number of days
        And the user should see that the subscription renews for the amount that the "Plus" plan costs

    # Tested
    Scenario: User switches from Plus to Pro plan
        Given the user has subscribed to the Plus plan
        And the user clicks "Switch to Pro"
        Then the user should be billed the prorated amount
        Then the user should see that the subscription renews in some number of days
        And the user should see that the subscription renews for the amount that the "Pro" plan costs
