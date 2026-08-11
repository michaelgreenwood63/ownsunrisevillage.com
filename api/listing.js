// Proxy to KelownaListings hub — no DDF credentials needed on this site
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key param required' });

  try {
    const hubRes = await fetch(`https://kelownalistings.com/api/listing?key=${encodeURIComponent(key)}`);
    const data   = await hubRes.json();
    return res.status(hubRes.status).json(data);
  } catch (err) {
    console.error('Hub error:', err.message);
    return res.status(502).json({ error: err.message });
  }
};
