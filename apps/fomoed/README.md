# Welcome to fomoed!

## Known issues

- Subscriptions in the DB are not correctly updated (especially on cancellation)! This limits the ability to check whether the user
has an active plan or not when the API is used by the FE. (for example liquidation map)
- Currently the user subscription is retrieved directly from Stripe, which is not optimal.
- Setting a custom price through Stripe on user's subscription will cause the Plans page to not display any subscription as selected.
- Switching a plan to another unsubscribes from all active plans and only then redirects to the checkout. If the user cancels the checkout, they will be unsubscribed from the current plan, which potentially causes the project owner to lose some money!

## DB initialization for a new project:

> Todo

## Testing emails

```
(echo "Subject: HTML Email"; echo "Content-Type: text/html"; cat ./src/templates/reset-password.html) | msmtp jakub.blaha@gmail.com
```