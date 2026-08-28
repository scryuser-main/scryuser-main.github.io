// Scry — first-party, cookieless visit beacon. No cookies, no localStorage identity,
// no third parties. Sends one anonymous beacon per pageview to our own worker, which
// dedupes to unique visitors server-side and drops bots. Owner opt-out: visit ?noscry=1.
(function () {
  'use strict';
  var API = 'https://scry-analytics.scry-license.workers.dev/hit';
  try {
    var qs = new URLSearchParams(location.search);
    // Owner self-exclusion: ?noscry=1 sets a flag; ?noscry=0 clears it.
    if (qs.get('noscry') === '1') { try { localStorage.setItem('scry_noscry', '1'); } catch (e) {} }
    if (qs.get('noscry') === '0') { try { localStorage.removeItem('scry_noscry'); } catch (e) {} }
    var own = false;
    try { own = localStorage.getItem('scry_noscry') === '1'; } catch (e) {}

    var payload = {
      path: location.pathname + (qs.get('utm_source') ? '' : ''),
      ref: document.referrer || '',
      utm_source: qs.get('utm_source') || '',
      utm_medium: qs.get('utm_medium') || '',
      utm_campaign: qs.get('utm_campaign') || '',
      own: own,
    };
    var body = new Blob([JSON.stringify(payload)], { type: 'text/plain' });
    // text/plain + sendBeacon = simple request, no CORS preflight, non-blocking.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API, body);
    } else {
      fetch(API, { method: 'POST', body: body, keepalive: true, mode: 'cors' }).catch(function () {});
    }
  } catch (e) { /* analytics must never break the page */ }
})();
