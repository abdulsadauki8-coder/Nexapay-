export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { paymentId, accessToken } = req.body;

    if (!paymentId || !accessToken) {
      return res.status(400).json({
        error: "paymentId and accessToken are required"
      });
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Pi approval error:", error);

    return res.status(500).json({
      error: "Payment approval failed"
    });
  }
}