async function checkDeployment() {
  console.log('Checking live deployment: https://wix-headless-jet.vercel.app/ ...');
  try {
    const res = await fetch('https://wix-headless-jet.vercel.app/?t=' + Date.now(), { cache: 'no-store' });
    const html = await res.text();
    const scriptMatch = html.match(/\/assets\/index-[^"']+\.js/);
    console.log('Current HTML script tag:', scriptMatch ? scriptMatch[0] : 'None');
    
    if (scriptMatch) {
      const jsUrl = 'https://wix-headless-jet.vercel.app' + scriptMatch[0];
      const jsRes = await fetch(jsUrl, { cache: 'no-store' });
      const js = await jsRes.text();
      const hasClientId = js.includes('1fe2dd83-1c28-450a-8f3a-9ee727449674');
      const hasSubmitReview = js.includes('/api/submit-review');
      console.log('Script URL:', jsUrl);
      console.log('Has baked-in Client ID (1fe2dd83...):', hasClientId);
      console.log('Has submit-review API reference:', hasSubmitReview);
      return hasClientId;
    }
  } catch (err) {
    console.error('Check error:', err.message);
  }
  return false;
}

checkDeployment();
