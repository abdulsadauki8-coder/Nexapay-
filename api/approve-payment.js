export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        error: "Payment ID is required"
      });
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      payment: data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Server approval failed"
    });
  }
}