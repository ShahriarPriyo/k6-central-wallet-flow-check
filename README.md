# k6 Assessment 
## Description about main flow

### Status Change of Transaction ( Not Found -> Allocated)
- In the First Phase : A "Not Found" status transaction has been changed to "Allocated" status.
- What needs to be checked : Used 4 users with 1 iteration. Only 1 user can change the status. Other 3 user's request will not impact the transaction as once the status is changed, system will prevent other users from changing status.
- 
### Convert previous status of the Transaction (Allocated -> Transferred)
- In the Second Phase : A "Allocated" status transaction has been changed to "Transferred" status.
- What needs to be checked: Again 4 users will try to change the status. Only one user's call will be successful.

## Main Purposes:
- How system behave when multiple users try to change transaction status.
- Checking balance transfer from one user to another without any anomaly.
- Check system generates proper log for every transaction and does not duplicate log for any failed attempts.
