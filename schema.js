(function () {
  var BASE = 'https://ownsunrisevillage.com';
  var path = window.location.pathname.replace(/\/$/, '') || '/';

  function inject(data) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(data);
    (document.head || document.body).appendChild(s);
  }

  inject({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['RealEstateAgent', 'LocalBusiness'],
        '@id': BASE + '#business',
        'name': 'Mark Jontz & Associates | Sunrise Village',
        'url': BASE,
        'telephone': '+12508616002',
        'email': 'info@markjontz.com',
        'description': 'Mark Jontz & Associates — the dedicated real estate resource for Sunrise Village, a 207-home 45+ land-lease community at 1255 and 1260 Raymer Avenue, Kelowna. 50+ transactions facilitated inside the community.',
        'areaServed': [
          { '@type': 'City', 'name': 'Kelowna', 'addressRegion': 'BC', 'addressCountry': 'CA' },
          { '@type': 'Place', 'name': 'Sunrise Village, Raymer Avenue, Kelowna', 'addressRegion': 'BC', 'addressCountry': 'CA' }
        ],
        'knowsAbout': [
          'Sunrise Village Kelowna real estate',
          'Sunrise Village homes for sale',
          'Raymer Avenue Kelowna',
          'Kelowna land lease homes',
          'BC Manufactured Home Park Tenancy Act',
          'Springfield Spall 45+ community',
          '45+ community Kelowna'
        ],
        'employee': [
          { '@type': 'Person', 'name': 'Mark Jontz', 'jobTitle': 'Team Lead, REALTOR®' },
          { '@type': 'Person', 'name': 'Michael Greenwood', 'jobTitle': 'REALTOR®' }
        ]
      }
    ]
  });

  if (path === '/' || path === '') {
    inject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'url': BASE,
      'name': 'Own Sunrise Village',
      'description': 'Sunrise Village Kelowna real estate — a 207-home, 45+ land-lease community on Raymer Avenue. Browse active listings with Mark Jontz & Associates.'
    });

    inject({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is Sunrise Village Kelowna?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sunrise Village is a 207-home, age 45-and-over land-lease community at 1255 and 1260 Raymer Avenue in Kelowna\'s Springfield/Spall area. It includes a mix of manufactured and built-on-site rancher-style homes, with an active clubhouse featuring an outdoor pool, hot tub, fitness room, library, and billiards room. Mark Jontz & Associates has facilitated 50+ transactions inside the community.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What does "land lease" mean at Sunrise Village?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'At Sunrise Village, buyers own their home outright but lease the land it sits on, under a lease governed by BC\'s Manufactured Home Park Tenancy Act. The land is 100% privately owned, with no strata corporation or HOA involved. This typically means a lower purchase price than an equivalent fee-simple property, with one monthly land lease payment as the only recurring community charge.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do I need to be 45 to buy at Sunrise Village?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes — Sunrise Village enforces a strict minimum age of 45 for residents, with no exceptions. Because it is a private leasehold community rather than a strata, the age restriction is strictly enforced as part of every purchase.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do I need approval to buy a home at Sunrise Village?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes — every offer at Sunrise Village is written subject to the buyer securing park approval from Sunrise Village management before the offer is finalized, which includes reviewing and signing the community\'s Rules & Regulations.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What amenities does Sunrise Village have?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sunrise Village\'s clubhouse includes a heated outdoor pool, hot tub, fitness room, library, billiards room, and a shared greenhouse available to all residents. The community is centrally located in Springfield/Spall, close to shopping, dining, medical services, and the Mission Creek Greenway.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I install solar panels at Sunrise Village?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes — rooftop solar is permitted with written approval from Sunrise Village management and a licensed installer. Ground-mounted solar systems are not permitted.'
          }
        }
      ]
    });
  }

  var PAGES = {
    '/team':       'Our Team',
    '/contact':    'Contact',
    '/homesafe':   'Homesafe Program',
    '/clubhouse':  'Clubhouse',
    '/location':   'Location',
    '/rules-regs': 'Rules & Regulations',
    '/blog':       'Blog'
  };

  if (PAGES[path]) {
    inject({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Sunrise Village Kelowna Real Estate', 'item': BASE + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': PAGES[path], 'item': BASE + path }
      ]
    });
  }
})();
