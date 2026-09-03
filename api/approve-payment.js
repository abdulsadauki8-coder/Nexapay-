export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.PI_API_KEY) {
    console.error('Missing PI_API_KEY environment variable');
    return res.status(500).json({ error: 'Pi server is not configured' });
  }

  try {
    const { paymentId } = req.body || {};

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'A valid paymentId is required' });
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Pi approval failed:', response.status, data);
      return res.status(response.status).json({
        error: data.error || data.message || 'Pi approval failed',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      payment: data
    });
  } catch (error) {
    console.error('Approval route error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server approval failed'
    });
  }
}