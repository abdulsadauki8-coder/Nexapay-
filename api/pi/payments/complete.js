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
    const { paymentId, txid } = req.body || {};

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'A valid paymentId is required' });
    }
    if (!txid || typeof txid !== 'string') {
      return res.status(400).json({ error: 'A valid txid is required' });
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Pi completion failed:', response.status, data);
      return res.status(response.status).json({
        error: data.error || data.message || 'Pi completion failed',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      payment: data
    });
  } catch (error) {
    console.error('Completion route error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server completion failed'
    });
  }
}