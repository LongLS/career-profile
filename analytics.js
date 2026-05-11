/* Lightweight analytics tracker
 * Usage:
 *   trackPageView('list-jobs')
 *   trackJobView(jobId)
 * Requires `db` (supabase client) defined before this script runs.
 */
(function () {
  if (typeof db === 'undefined') {
    console.warn('[Analytics] supabase client `db` is not defined');
    return;
  }

  // Avoid double-counting on quick refreshes within the same session
  function shouldTrack(key, ttlMs = 30 * 1000) {
    try {
      const last = sessionStorage.getItem(key);
      if (last && Date.now() - Number(last) < ttlMs) return false;
      sessionStorage.setItem(key, String(Date.now()));
    } catch (_) {} // sessionStorage may be blocked
    return true;
  }

  window.trackPageView = function (page) {
    if (!shouldTrack('pv_' + page + '_' + location.pathname)) return;
    db.from('page_views').insert({
      page,
      path: location.pathname,
      referrer: document.referrer || null,
    }).then(({ error }) => {
      if (error) console.warn('[Analytics] page_views insert failed', error);
    });
  };

  window.trackJobView = function (jobId) {
    if (!jobId) return;
    if (!shouldTrack('jv_' + jobId)) return;
    db.from('job_views').insert({ job_id: jobId }).then(({ error }) => {
      if (error) console.warn('[Analytics] job_views insert failed', error);
    });
  };
})();
