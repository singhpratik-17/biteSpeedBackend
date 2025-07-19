## Bitespeed Identity Reconciliation

### Live API
[https://bitespeedbackendat17.onrender.com/identify](https://bitespeedbackendat17.onrender.com/identify)

### How to Run Locally
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up `.env` with your PostgreSQL `DATABASE_URL`
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`

### API Usage

**POST /identify**

Request:
```json
{
  "email": "abc@flux.com",
  "phoneNumber": "123456"
}
```

Response:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["abc@flux.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```
```

---

### 2. **Testing the Live Endpoint**

You can test the endpoint with:

```bash
curl -X POST https://bitespeedbackendat17.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"654321"}'
```

---

### 3. **Submission Checklist**

- [x] **GitHub repo is up to date**
- [x] **README includes the live endpoint**
- [x] **Live endpoint is accessible** ([see here](https://bitespeedbackendat17.onrender.com))
- [x] **API works as described in the Bitespeed Backend Task: Identity Reconciliation**
