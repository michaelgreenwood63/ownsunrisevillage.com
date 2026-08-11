// Proxy to KelownaListings hub — no DDF credentials needed on this site
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const hubRes = await fetch('https://kelownalistings.com/api/listings?area=sunrisevillage');
    const data   = await hubRes.json();
    if (!data.configured || data.error) return res.status(200).json(data);
    return res.status(200).json({ configured: true, listings: data.listings || [], count: (data.listings || []).length });
  } catch (err) {
    console.error('Hub error:', err.message);
    return res.status(502).json({ configured: true, error: err.message, listings: [], count: 0 });
  }
};
