(function () {
  'use strict';

  var PER_PAGE = 20;

  var _allListings = [];
  var _store       = {};
  var _filters     = { type: 'all', minPrice: 0, maxPrice: Infinity, minBeds: 0, minBaths: 0 };
  var _page        = 1;

  /* ── helpers ── */

  function formatPrice(price) {
    if (!price) return 'Price on Request';
    return '$' + Number(price).toLocaleString('en-CA', { maximumFractionDigits: 0 });
  }

  function daysOnMarket(dateStr) {
    if (!dateStr) return null;
    var d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (d <= 0) return 'Listed today';
    if (d === 1) return '1 day on market';
    return d + ' days on market';
  }

  function mainPhotoUrl(listing) {
    var media = listing.Media;
    if (!media || !media.length) return null;
    var sorted = media.slice().sort(function (a, b) { return (a.Order || 0) - (b.Order || 0); });
    return sorted[0].MediaURL || null;
  }

  function structureType(l) {
    var s = l.StructureType;
    return (Array.isArray(s) ? s[0] : s) || l.PropertySubType || '';
  }

  function propTypeLabel(l) {
    var t = structureType(l).toLowerCase();
    if (t.includes('apartment'))                    return 'Condo';
    if (t.includes('row') || t.includes('townhouse')) return 'Townhome';
    if (t.includes('manufactured'))                 return 'Mobile Home';
    if (t.includes('duplex'))                       return 'Duplex';
    if (t.includes('house'))                        return 'House';
    return structureType(l);
  }

  /* ── card renderer ── */

  function renderCard(l) {
    var photo     = mainPhotoUrl(l);
    var unit      = l.UnitNumber ? 'Unit ' + l.UnitNumber + ' — ' : '';
    var addr      = unit + (l.StreetNumber || '') + ' ' + (l.StreetName || '') + ' ' + (l.StreetSuffix || '');
    var parts     = [];
    if (l.BedroomsTotal)         parts.push(l.BedroomsTotal + ' bed');
    if (l.BathroomsTotalInteger) parts.push(l.BathroomsTotalInteger + ' bath');
    if (l.LivingArea)            parts.push(Math.round(l.LivingArea).toLocaleString() + ' sq ft');
    var specs     = parts.join(' · ');
    var dom       = daysOnMarket(l.OriginalEntryTimestamp);
    var mls       = l.ListingId ? 'MLS® ' + l.ListingId : '';
    var brokerage = l.ListOfficeName || null;
    var typeLabel = propTypeLabel(l);
    var bgStyle   = photo ? ' style="background-image:url(\'' + photo.replace(/'/g, "\\'") + '\')"' : '';
    var key       = l.ListingKey || l.ListingId;
    var proptype  = structureType(l);

    return '<div class="listing-card" data-key="' + key + '" data-proptype="' + proptype + '" style="cursor:pointer">' +
      '<div class="listing-photo"' + bgStyle + '>' +
        (!photo ? '<div class="listing-no-photo">No Photo Available</div>' : '') +
        '<div class="listing-price">' + formatPrice(l.ListPrice) + '</div>' +
        (typeLabel ? '<div class="listing-type-badge">' + typeLabel + '</div>' : '') +
      '</div>' +
      '<div class="listing-body">' +
        '<div class="listing-address">' + addr.trim() + '</div>' +
        (specs ? '<div class="listing-specs">' + specs + '</div>' : '') +
        (dom   ? '<div class="listing-dom">' + dom + '</div>' : '') +
        (mls   ? '<div class="listing-mls">' + mls + '</div>' : '') +
        '<div class="listing-actions">' +
          '<span class="listing-cta listing-cta-ext">View Listing →</span>' +
          '<a href="/contact" class="listing-cta listing-cta-contact" onclick="event.stopPropagation()">Request Info</a>' +
        '</div>' +
        (brokerage ? '<div class="listing-brokerage">Listing courtesy of ' + brokerage + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  /* ── filter + paginate ── */

  function applyFilters() {
    return _allListings.filter(function (l) {
      if (_filters.type !== 'all') {
        var pt = structureType(l).toLowerCase();
        if (!pt.includes(_filters.type.toLowerCase())) return false;
      }
      var price = l.ListPrice || 0;
      if (price < _filters.minPrice || price > _filters.maxPrice) return false;
      var beds = l.BedroomsTotal || 0;
      if (beds < _filters.minBeds) return false;
      var baths = l.BathroomsTotalInteger || 0;
      if (baths < _filters.minBaths) return false;
      return true;
    });
  }

  function renderPage() {
    var container = document.getElementById('listings-container');
    if (!container) return;

    var filtered   = applyFilters();
    var total      = filtered.length;
    var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (_page > totalPages) _page = totalPages;
    if (_page < 1) _page = 1;

    if (total === 0) {
      container.innerHTML = '<p class="listings-empty" style="grid-column:1/-1">No listings match your filters. ' +
        '<a href="#" onclick="resetFilters();return false" style="color:var(--red);font-weight:700">Clear filters</a> ' +
        'or <a href="/contact" style="color:var(--red);font-weight:700">contact us</a> for current availability.</p>';
      renderPagination(0, 0);
      return;
    }

    var start        = (_page - 1) * PER_PAGE;
    var pageListings = filtered.slice(start, start + PER_PAGE);

    container.innerHTML = pageListings.map(renderCard).join('');
    container.querySelectorAll('.listing-card[data-key]').forEach(function (card) {
      card.addEventListener('click', function () {
        window.location.href = '/listing?id=' + encodeURIComponent(card.getAttribute('data-key'));
      });
    });

    renderPagination(totalPages, total);
  }

  /* ── featured listings (Mark Jontz's own current listings) ── */

  var FEATURED_AGENT_NAME = 'Mark Jontz';

  function renderFeaturedListings() {
    var section   = document.getElementById('featured-listings');
    var container = document.getElementById('featured-listings-container');
    if (!section || !container) return;

    var featured = _allListings.filter(function (l) {
      return (l.ListAgentFullName || '').toLowerCase() === FEATURED_AGENT_NAME.toLowerCase();
    });

    var seen = {};
    featured = featured.filter(function (l) {
      var key = l.ListingKey || l.ListingId;
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });

    featured.sort(function (a, b) {
      return new Date(b.OriginalEntryTimestamp || 0) - new Date(a.OriginalEntryTimestamp || 0);
    });
    var seenAddr = {};
    featured = featured.filter(function (l) {
      var addrKey = [l.StreetNumber, l.StreetName, l.StreetSuffix, l.UnitNumber].join('|').toLowerCase();
      if (seenAddr[addrKey]) return false;
      seenAddr[addrKey] = true;
      return true;
    });

    if (!featured.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    container.innerHTML = featured.map(renderCard).join('');
    container.querySelectorAll('.listing-card[data-key]').forEach(function (card) {
      card.addEventListener('click', function () {
        window.location.href = '/listing?id=' + encodeURIComponent(card.getAttribute('data-key'));
      });
    });
  }

  function renderPagination(totalPages, total) {
    var el = document.getElementById('listings-pagination');
    if (!el) return;
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    var start = (_page - 1) * PER_PAGE + 1;
    var end   = Math.min(_page * PER_PAGE, total);

    el.innerHTML =
      '<div class="pagination">' +
        '<button class="page-btn" onclick="goPage(' + (_page - 1) + ')"' + (_page <= 1 ? ' disabled' : '') + '>← Prev</button>' +
        '<span class="page-info">Showing ' + start + '–' + end + ' of ' + total + ' listings</span>' +
        '<button class="page-btn" onclick="goPage(' + (_page + 1) + ')"' + (_page >= totalPages ? ' disabled' : '') + '>Next →</button>' +
      '</div>';
  }

  /* ── global filter functions (called from HTML) ── */

  window.filterType = function (btn, type) {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    _filters.type = type;
    _page = 1;
    renderPage();
  };

  window.filterPrice = function (select) {
    var val = select.value;
    if (!val) {
      _filters.minPrice = 0;
      _filters.maxPrice = Infinity;
    } else {
      var parts = val.split('-');
      _filters.minPrice = parseInt(parts[0], 10) || 0;
      _filters.maxPrice = parseInt(parts[1], 10) || Infinity;
    }
    _page = 1;
    renderPage();
  };

  window.filterBeds = function (select) {
    _filters.minBeds = parseInt(select.value, 10) || 0;
    _page = 1;
    renderPage();
  };

  window.filterBaths = function (select) {
    _filters.minBaths = parseInt(select.value, 10) || 0;
    _page = 1;
    renderPage();
  };

  window.goPage = function (n) {
    _page = n;
    renderPage();
    var anchor = document.getElementById('listings');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.resetFilters = function () {
    _filters = { type: 'all', minPrice: 0, maxPrice: Infinity, minBeds: 0, minBaths: 0 };
    _page = 1;
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('onclick') && b.getAttribute('onclick').includes("'all'"));
    });
    var p = document.getElementById('price-filter');
    if (p) p.value = '';
    var beds = document.getElementById('beds-filter');
    if (beds) beds.value = '0';
    var baths = document.getElementById('baths-filter');
    if (baths) baths.value = '0';
    renderPage();
  };

  /* ── initial load ── */

  function loadListings() {
    var container = document.getElementById('listings-container');
    if (!container) return;

    fetch('/api/listings')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.configured) { container.innerHTML = ''; return; }

        if (data.error) {
          container.innerHTML = '<p class="listings-empty" style="grid-column:1/-1">Could not load listings right now. <a href="/contact">Contact us</a> for current availability.</p>';
          return;
        }

        _allListings = data.listings || [];
        _store = {};
        _allListings.forEach(function (l) {
          var key = l.ListingKey || l.ListingId;
          if (key) _store[key] = l;
        });

        var countEl = document.getElementById('stat-listing-count');
        if (countEl && _allListings.length > 0) countEl.textContent = _allListings.length;

        if (_allListings.length === 0) {
          container.innerHTML = '<p class="listings-empty" style="grid-column:1/-1">No active listings right now. <a href="/contact">Contact us</a> to get notified when something hits the market.</p>';
          return;
        }

        renderPage();
        renderFeaturedListings();

        var disc = document.getElementById('listings-disclaimer');
        if (disc) {
          disc.style.display = 'block';
          disc.innerHTML = 'Not all listings appear here — participation in CREA\'s data sharing program varies by brokerage. ' +
            'We also have access to <strong>off-market opportunities</strong> not yet on MLS®. ' +
            '<a href="/contact">Contact us for the full picture →</a>';
        }
      })
      .catch(function () {
        container.innerHTML = '<p class="listings-empty" style="grid-column:1/-1">Could not load listings. <a href="/contact">Contact us</a> directly.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadListings);
  } else {
    loadListings();
  }
})();
