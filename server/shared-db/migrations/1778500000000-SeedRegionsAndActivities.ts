import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRegionsAndActivities1778500000000 implements MigrationInterface {
    name = 'SeedRegionsAndActivities1778500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── 1. Insert Regions ──────────────────────────────────────────────────
        const insertedRegions: { id: number; name: string }[] =
            await queryRunner.query(`
                INSERT INTO regions (name, description, images, rating, created_at, updated_at) VALUES
                ('Paris, France',      'The city of light, art, and romance nestled along the Seine River.',                                          '{}', 4.80, NOW(), NOW()),
                ('Bali, Indonesia',    'A tropical paradise blending lush rice terraces, surf, temples, and spa retreats.',                           '{}', 4.75, NOW(), NOW()),
                ('Tokyo, Japan',       'A hyper-modern metropolis where ancient traditions coexist with futuristic technology.',                      '{}', 4.85, NOW(), NOW()),
                ('New York, USA',      'The city that never sleeps — iconic skyline, world-class food, culture, and energy.',                         '{}', 4.70, NOW(), NOW()),
                ('Santorini, Greece',  'Whitewashed cliffs, volcanic beaches, and spectacular sunsets over the Aegean Sea.',                          '{}', 4.78, NOW(), NOW()),
                ('Nairobi, Kenya',     'Gateway to East Africa''s greatest wildlife and the legendary Maasai Mara safari.',                           '{}', 4.65, NOW(), NOW()),
                ('Barcelona, Spain',   'A vibrant coastal city famous for Gaudí architecture, tapas, and Mediterranean beaches.',                     '{}', 4.72, NOW(), NOW()),
                ('Maldives',           'Overwater bungalows, crystal-clear lagoons, and some of the world''s best diving and snorkeling.',            '{}', 4.90, NOW(), NOW()),
                ('Rajasthan, India',   'The land of maharajas — golden deserts, majestic forts, and vibrant culture.',                                '{}', 4.68, NOW(), NOW()),
                ('Patagonia, Chile',   'Untamed wilderness at the end of the world — glaciers, fjords, and dramatic mountain peaks.',                 '{}', 4.82, NOW(), NOW()),
                ('Rome, Italy',        'The eternal city, where every cobblestone leads to ancient ruins, world-famous art, and incredible cuisine.', '{}', 4.76, NOW(), NOW()),
                ('Dubai, UAE',         'A futuristic desert city of record-breaking skyscrapers, luxury, and non-stop adventure.',                    '{}', 4.69, NOW(), NOW())
                RETURNING id, name
            `);

        // Build name → id lookup
        const regionMap: Record<string, number> = {};
        for (const r of insertedRegions) {
            regionMap[r.name] = r.id;
        }

        // ── 2. Insert Activities ───────────────────────────────────────────────
        await queryRunner.query(`
            INSERT INTO activities (name, tag_line, description, region_id, images, type, rating, created_at, updated_at) VALUES

            -- Paris, France
            ('Eiffel Tower Visit',         'An icon worth every step',               'Climb or take the lift to the top of the world''s most visited monument for breathtaking views of Paris.',      ${regionMap['Paris, France']},     '{}', 'sightseeing',  4.90, NOW(), NOW()),
            ('Louvre Museum Tour',          'Home to the Mona Lisa',                 'Explore one of the largest art museums in the world, housing over 35,000 works of art across 60,600 sq m.',     ${regionMap['Paris, France']},     '{}', 'cultural',     4.85, NOW(), NOW()),
            ('Seine River Cruise',          'Paris from the water',                  'A relaxing boat cruise along the Seine, gliding past Notre-Dame, the Louvre, and the Eiffel Tower.',            ${regionMap['Paris, France']},     '{}', 'relaxation',   4.70, NOW(), NOW()),
            ('Montmartre Walking Tour',     'Art, history, and Sacré-Cœur',         'Wander the charming hilltop village that inspired Picasso and Toulouse-Lautrec, ending at the white basilica.', ${regionMap['Paris, France']},     '{}', 'cultural',     4.65, NOW(), NOW()),
            ('French Cooking Class',        'Cook like a Parisian chef',             'Learn to prepare classic French dishes — croissants, coq au vin, and crème brûlée — in a hands-on session.',   ${regionMap['Paris, France']},     '{}', 'food',         4.80, NOW(), NOW()),
            ('Versailles Day Trip',         'The palace of the Sun King',            'Visit the opulent Palace of Versailles and stroll through its stunning gardens, just 40 minutes from Paris.',   ${regionMap['Paris, France']},     '{}', 'cultural',     4.75, NOW(), NOW()),
            ('Paris Wine Tasting',          'Uncork the best of French wine',        'A guided sommelier session sampling Bordeaux, Burgundy, and Champagne paired with artisan cheese.',             ${regionMap['Paris, France']},     '{}', 'food',         4.72, NOW(), NOW()),

            -- Bali, Indonesia
            ('Ubud Rice Terrace Trek',      'Walk through living art',               'Hike through the iconic Tegallalang terraced rice paddies and learn about traditional Balinese irrigation.',    ${regionMap['Bali, Indonesia']},   '{}', 'adventure',    4.78, NOW(), NOW()),
            ('Surf Lessons at Kuta',        'Ride your first wave',                  'Beginner-friendly surf lessons on Kuta Beach with certified instructors — boards and rash guards included.',    ${regionMap['Bali, Indonesia']},   '{}', 'sports',       4.65, NOW(), NOW()),
            ('Temple Hopping Tour',         'Discover Bali''s sacred sites',         'Visit Tanah Lot, Uluwatu, and Besakih temples, experiencing traditional Kecak fire dance at sunset.',           ${regionMap['Bali, Indonesia']},   '{}', 'cultural',     4.80, NOW(), NOW()),
            ('Balinese Cooking Class',      'Spice up your travel memories',         'Visit a local market, then cook a full Balinese meal with jamu, satay, and black rice pudding.',                ${regionMap['Bali, Indonesia']},   '{}', 'food',         4.82, NOW(), NOW()),
            ('Mount Batur Sunrise Hike',    'Chase the sunrise above the clouds',    'A guided pre-dawn hike up an active volcano (1,717 m) to catch a golden sunrise over the caldera lake.',       ${regionMap['Bali, Indonesia']},   '{}', 'adventure',    4.88, NOW(), NOW()),
            ('Spa & Wellness Retreat',      'Relax the Balinese way',               'Traditional Balinese massage, flower bath, and aromatherapy in a jungle-side open-air spa.',                    ${regionMap['Bali, Indonesia']},   '{}', 'relaxation',   4.90, NOW(), NOW()),
            ('Snorkeling at Nusa Penida',   'Swim with manta rays',                 'Boat trip to Nusa Penida''s crystal waters to snorkel alongside manta rays at Manta Point.',                    ${regionMap['Bali, Indonesia']},   '{}', 'adventure',    4.85, NOW(), NOW()),
            ('White Water Rafting',         'Rush through the jungle rapids',        'An exhilarating rafting experience down the Ayung River through tropical rainforest canyons.',                  ${regionMap['Bali, Indonesia']},   '{}', 'sports',       4.70, NOW(), NOW()),

            -- Tokyo, Japan
            ('Tsukiji Outer Market Food Tour', 'Taste Tokyo''s freshest flavours',  'A guided morning food walk through the world-famous Tsukiji Outer Market sampling sushi, tamagoyaki, and more.',${regionMap['Tokyo, Japan']},     '{}', 'food',         4.85, NOW(), NOW()),
            ('Shibuya Crossing Experience', 'Embrace the organised chaos',           'Stand at the world''s busiest pedestrian crossing and soak up the electric energy of modern Tokyo.',            ${regionMap['Tokyo, Japan']},     '{}', 'sightseeing',  4.70, NOW(), NOW()),
            ('Samurai Experience',          'Wield a katana like a warrior',         'Dress in authentic samurai armour, learn sword technique (tameshigiri), and receive a personalised scroll.',    ${regionMap['Tokyo, Japan']},     '{}', 'cultural',     4.80, NOW(), NOW()),
            ('Mount Fuji Day Trip',         'Japan''s sacred summit',                'Guided day trip to Mount Fuji''s 5th Station with optional hiking, plus a visit to Lake Kawaguchi.',            ${regionMap['Tokyo, Japan']},     '{}', 'adventure',    4.88, NOW(), NOW()),
            ('Zen Meditation Session',      'Find stillness in the city',            'A mindful morning at a traditional Zen Buddhist temple — guided meditation, sutra chanting, and tea ceremony.', ${regionMap['Tokyo, Japan']},     '{}', 'relaxation',   4.75, NOW(), NOW()),
            ('Ramen Making Class',          'Master the art of Japanese noodles',    'Learn the secrets of tonkotsu and shoyu broth from a master ramen chef in a small-group kitchen session.',     ${regionMap['Tokyo, Japan']},     '{}', 'food',         4.82, NOW(), NOW()),
            ('Harajuku Street Fashion Tour','Where fashion meets fantasy',           'An insider tour of Takeshita Street exploring Tokyo''s eccentric fashion subcultures with a local stylist.',    ${regionMap['Tokyo, Japan']},     '{}', 'cultural',     4.60, NOW(), NOW()),

            -- New York, USA
            ('Statue of Liberty & Ellis Island', 'Symbol of freedom',              'Ferry trip to Liberty Island and Ellis Island with guided audio tour of America''s most iconic monuments.',      ${regionMap['New York, USA']},    '{}', 'sightseeing',  4.78, NOW(), NOW()),
            ('Central Park Cycling',        'NYC''s green escape on two wheels',    'Rent a bike and explore 843 acres of urban parkland, from Bethesda Fountain to the Great Lawn.',                ${regionMap['New York, USA']},    '{}', 'sports',       4.65, NOW(), NOW()),
            ('Broadway Show',               'Lights, curtain, action!',             'Experience a world-class Broadway musical or play in the Theatre District — the heartbeat of American drama.',  ${regionMap['New York, USA']},    '{}', 'cultural',     4.90, NOW(), NOW()),
            ('Brooklyn Food Tour',          'Eat your way across the bridge',        'A guided walk through DUMBO, Williamsburg, and Smorgasburg sampling Brooklyn''s best bites and brews.',        ${regionMap['New York, USA']},    '{}', 'food',         4.75, NOW(), NOW()),
            ('High Line Walk',              'An elevated urban garden',              'Stroll the 2.3 km elevated park built on a disused rail line, with public art and skyline views.',              ${regionMap['New York, USA']},    '{}', 'sightseeing',  4.70, NOW(), NOW()),
            ('Metropolitan Museum Tour',    'Art across 5,000 years',               'A curated highlights tour of the Met — from Egyptian mummies to Impressionist masterpieces.',                   ${regionMap['New York, USA']},    '{}', 'cultural',     4.85, NOW(), NOW()),
            ('NYC Helicopter Tour',         'Manhattan from the sky',               'A thrilling 15-minute helicopter flight over the Manhattan skyline, Hudson River, and Central Park.',           ${regionMap['New York, USA']},    '{}', 'adventure',    4.80, NOW(), NOW()),

            -- Santorini, Greece
            ('Caldera Sunset Viewing',      'The world''s most famous sunset',       'Watch the legendary Oia sunset from the best vantage point, painting the caldera in shades of gold and pink.', ${regionMap['Santorini, Greece']}, '{}', 'sightseeing', 4.92, NOW(), NOW()),
            ('Santorini Wine Tasting',      'Sip volcanic wines',                    'Tour three leading wineries tasting Assyrtiko, Vinsanto, and Nykteri wines grown in volcanic Santorini soil.',  ${regionMap['Santorini, Greece']}, '{}', 'food',        4.80, NOW(), NOW()),
            ('Volcano & Hot Springs Cruise','Sail to the living caldera',            'Boat tour to Nea Kameni volcano for a hike to the crater, then swim in natural thermal hot springs.',           ${regionMap['Santorini, Greece']}, '{}', 'adventure',   4.75, NOW(), NOW()),
            ('Oia Village Walk',            'Blue domes and white walls',            'Wander the iconic lanes of Oia village discovering boutiques, art galleries, and panoramic sea views.',         ${regionMap['Santorini, Greece']}, '{}', 'cultural',    4.70, NOW(), NOW()),
            ('Greek Cooking Class',         'The taste of the Aegean',              'Cook a traditional Greek feast — spanakopita, moussaka, baklava — with a local host in their home kitchen.',   ${regionMap['Santorini, Greece']}, '{}', 'food',        4.82, NOW(), NOW()),
            ('Sea Kayaking',                'Paddle the Aegean cliffs',             'A guided sea kayaking tour through volcanic sea caves and cliffs along Santorini''s dramatic coastline.',        ${regionMap['Santorini, Greece']}, '{}', 'sports',      4.68, NOW(), NOW()),
            ('ATV Island Adventure',        'Explore every corner of the island',   'Rent an ATV and discover Santorini''s black sand beaches, ancient ruins, and hidden villages at your own pace.',${regionMap['Santorini, Greece']}, '{}', 'adventure',   4.65, NOW(), NOW()),

            -- Nairobi, Kenya
            ('Maasai Mara Safari',          'The greatest wildlife show on Earth',   'A 3-day guided safari to Maasai Mara, home to the Big Five and the world-famous Great Migration.',            ${regionMap['Nairobi, Kenya']},   '{}', 'adventure',    4.95, NOW(), NOW()),
            ('Giraffe Centre Visit',        'Feed a Rothschild giraffe',             'An intimate wildlife experience at the African Fund for Endangered Wildlife sanctuary in Karen, Nairobi.',     ${regionMap['Nairobi, Kenya']},   '{}', 'sightseeing',  4.80, NOW(), NOW()),
            ('David Sheldrick Elephant Orphanage', 'Witness baby elephant rescue',  'Morning visit to the DSWT elephant orphanage to meet rescued baby elephants and their keepers.',              ${regionMap['Nairobi, Kenya']},   '{}', 'sightseeing',  4.85, NOW(), NOW()),
            ('Hot Air Balloon Safari',      'Soar above the savanna at dawn',        'A sunrise balloon flight over the Maasai Mara, followed by a champagne bush breakfast.',                       ${regionMap['Nairobi, Kenya']},   '{}', 'adventure',    4.90, NOW(), NOW()),
            ('Maasai Village Cultural Tour','Meet the red-clad warriors',            'A guided visit to an authentic Maasai village to experience their traditions, music, and beadwork.',           ${regionMap['Nairobi, Kenya']},   '{}', 'cultural',     4.70, NOW(), NOW()),
            ('Bush Camping Experience',     'Sleep under a million stars',           'Overnight tented camping in the wilderness with campfire dinners and nocturnal wildlife sounds.',              ${regionMap['Nairobi, Kenya']},   '{}', 'adventure',    4.75, NOW(), NOW()),
            ('Nairobi National Park Drive', 'Lions with a city skyline backdrop',    'A game drive in the only national park in the world located within a capital city — just 7 km from downtown.',${regionMap['Nairobi, Kenya']},   '{}', 'sightseeing',  4.65, NOW(), NOW()),

            -- Barcelona, Spain
            ('Sagrada Família Tour',        'Gaudí''s unfinished masterpiece',       'Skip-the-line guided tour of the UNESCO-listed basilica that has been under construction since 1882.',         ${regionMap['Barcelona, Spain']}, '{}', 'cultural',     4.90, NOW(), NOW()),
            ('La Boqueria Market Tour',     'Spain''s tastiest food market',          'A guided culinary tour through Barcelona''s legendary covered market sampling jamón, olives, and pintxos.',   ${regionMap['Barcelona, Spain']}, '{}', 'food',         4.78, NOW(), NOW()),
            ('Tapas & Wine Evening Tour',   'Eat like a local at night',             'Small-group evening tour through El Born and Gothic Quarter visiting hidden tapas bars and local bodegas.',    ${regionMap['Barcelona, Spain']}, '{}', 'food',         4.85, NOW(), NOW()),
            ('Flamenco Show',               'Passion, rhythm, and fire',             'An authentic tablao flamenco performance with live guitar and passionate dancing in an intimate venue.',        ${regionMap['Barcelona, Spain']}, '{}', 'cultural',     4.82, NOW(), NOW()),
            ('Park Güell Walking Tour',     'Gaudí''s mosaic wonderland',            'Guided walk through Gaudí''s whimsical hilltop park with panoramic city views and hidden architectural gems.', ${regionMap['Barcelona, Spain']}, '{}', 'sightseeing',  4.75, NOW(), NOW()),
            ('Gothic Quarter Tour',         'Two thousand years of history',         'A walking tour through Barcelona''s medieval heart, past Roman ruins, hidden plazas, and ancient churches.',  ${regionMap['Barcelona, Spain']}, '{}', 'cultural',     4.70, NOW(), NOW()),
            ('Barceloneta Beach Day',       'Sun, sea, and sangria',                'Spend a leisurely day at Barcelona''s most popular beach — swim, rent a kayak, or sip drinks at a chiringuito.',${regionMap['Barcelona, Spain']}, '{}', 'relaxation',   4.60, NOW(), NOW()),

            -- Maldives
            ('Snorkeling with Manta Rays',  'Dance with the ocean''s gentle giants',  'A guided snorkeling excursion to Hanifaru Bay, a UNESCO biosphere reserve and manta ray feeding ground.',     ${regionMap['Maldives']},         '{}', 'adventure',    4.95, NOW(), NOW()),
            ('Underwater Restaurant Dining','Dine beneath the Indian Ocean',          'An unforgettable meal surrounded by coral reefs and fish at one of the world''s most unique restaurants.',    ${regionMap['Maldives']},         '{}', 'food',         4.88, NOW(), NOW()),
            ('Sunset Dolphin Cruise',       'Sail with spinner dolphins',            'An evening dhoni cruise to watch hundreds of spinner dolphins leap and play in the warm Indian Ocean.',         ${regionMap['Maldives']},         '{}', 'relaxation',   4.85, NOW(), NOW()),
            ('Scuba Diving',                'Explore a world beneath the waves',     'Guided dive through vibrant coral reefs, swim with reef sharks, turtles, and colourful tropical fish.',        ${regionMap['Maldives']},         '{}', 'adventure',    4.90, NOW(), NOW()),
            ('Private Island Picnic',       'Your own paradise island for a day',    'A luxury dhoni boat transfers you to a deserted sandbank for a private picnic with champagne and fresh fruit.', ${regionMap['Maldives']},         '{}', 'relaxation',   4.92, NOW(), NOW()),
            ('Traditional Maldivian Fishing','Night fishing on a local dhoni',       'Fish using traditional handlines on a local wooden dhoni as the sun sets, cooking your catch onboard.',        ${regionMap['Maldives']},         '{}', 'other',        4.65, NOW(), NOW()),
            ('Bioluminescent Beach Walk',   'Walk through a sea of stars',           'After dark, wade in the shallow waters of a beach lit by millions of bioluminescent phytoplankton.',           ${regionMap['Maldives']},         '{}', 'sightseeing',  4.80, NOW(), NOW()),

            -- Rajasthan, India
            ('Jaipur Pink City Palace Tour','Step inside a royal fairy tale',        'Guided tour of the City Palace, Hawa Mahal, and Jantar Mantar observatory in the rose-pink walled city.',     ${regionMap['Rajasthan, India']}, '{}', 'cultural',     4.78, NOW(), NOW()),
            ('Thar Desert Camel Safari',    'Ride into a golden sunset',             'A camel safari through the Thar Desert dunes near Jaisalmer, ending with a campfire dinner under the stars.',  ${regionMap['Rajasthan, India']}, '{}', 'adventure',    4.82, NOW(), NOW()),
            ('Desert Camping',              'Sleep in a Bedouin tent under stars',   'Luxury or rustic overnight camp in the sand dunes with folk music, dance, and a starlit sky.',                 ${regionMap['Rajasthan, India']}, '{}', 'relaxation',   4.75, NOW(), NOW()),
            ('Block Printing Workshop',     'Create your own Indian textile',        'Hands-on workshop in Jaipur learning traditional wooden block printing techniques on fabric.',                 ${regionMap['Rajasthan, India']}, '{}', 'cultural',     4.68, NOW(), NOW()),
            ('Jaisalmer Fort Tour',         'A living fort in the desert',           'Explore the golden sandstone Jaisalmer Fort, still inhabited today, with its palaces, temples, and bazaars.',  ${regionMap['Rajasthan, India']}, '{}', 'sightseeing',  4.80, NOW(), NOW()),
            ('Ranthambore Tiger Safari',    'Track the Bengal tiger',                'Open jeep safari in Ranthambore National Park — one of India''s best places to spot wild Bengal tigers.',      ${regionMap['Rajasthan, India']}, '{}', 'adventure',    4.85, NOW(), NOW()),
            ('Henna Art Class',             'Wear traditional Rajasthani art',       'Learn the ancient art of mehendi from a local artist and return home with a beautiful hand design.',           ${regionMap['Rajasthan, India']}, '{}', 'cultural',     4.60, NOW(), NOW()),
            ('Pushkar Ghats at Sunrise',    'Spiritual dawn at a sacred lake',       'Watch priests perform morning aarti at Pushkar''s sacred ghats, one of Hinduism''s holiest sites.',            ${regionMap['Rajasthan, India']}, '{}', 'sightseeing',  4.72, NOW(), NOW()),

            -- Patagonia, Chile
            ('Torres del Paine Trek',       'The trek of a lifetime',                'A multi-day guided hike through Patagonia''s crown jewel — granite towers, glaciers, and emerald lakes.',     ${regionMap['Patagonia, Chile']}, '{}', 'adventure',    4.95, NOW(), NOW()),
            ('Perito Moreno Glacier Walk',  'Walk on a living glacier',              'Guided ice-trekking experience on the Perito Moreno Glacier with crampons and expert guides.',                 ${regionMap['Patagonia, Chile']}, '{}', 'adventure',    4.90, NOW(), NOW()),
            ('Fjord Kayaking',              'Paddle through the end of the world',   'Sea kayaking through Patagonia''s remote fjords surrounded by glaciers, condors, and absolute silence.',      ${regionMap['Patagonia, Chile']}, '{}', 'sports',       4.85, NOW(), NOW()),
            ('Wildlife Spotting Tour',      'Pumas, condors, and guanacos',          'Guided wildlife excursion in Torres del Paine to spot pumas, Andean condors, guanacos, and flamingos.',       ${regionMap['Patagonia, Chile']}, '{}', 'sightseeing',  4.80, NOW(), NOW()),
            ('Horseback Riding',            'Ride like a Patagonian gaucho',         'A guided horseback ride through Patagonian steppe and lakeside trails with a local gaucho.',                   ${regionMap['Patagonia, Chile']}, '{}', 'sports',       4.75, NOW(), NOW()),
            ('Wilderness Camping',          'Camp where roads end',                  'Multi-night backcountry camping experience in the heart of Torres del Paine National Park.',                   ${regionMap['Patagonia, Chile']}, '{}', 'adventure',    4.88, NOW(), NOW()),
            ('Ice Hiking on a Glacier',     'Explore an ancient ice world',          'Guided hike across the surface of Grey Glacier, exploring crevasses and ice formations with safety gear.',    ${regionMap['Patagonia, Chile']}, '{}', 'sports',       4.82, NOW(), NOW()),

            -- Rome, Italy
            ('Colosseum & Roman Forum Tour','Walk where gladiators fought',          'Skip-the-line guided tour of the 2,000-year-old Colosseum and the ancient ruins of the Roman Forum.',         ${regionMap['Rome, Italy']},      '{}', 'cultural',     4.90, NOW(), NOW()),
            ('Vatican Museums & Sistine Chapel', 'Gaze upon Michelangelo''s ceiling','Expert-guided tour of the Vatican Museums'' vast collection, culminating in the breathtaking Sistine Chapel.', ${regionMap['Rome, Italy']},      '{}', 'cultural',     4.88, NOW(), NOW()),
            ('Roman Pasta Making Class',    'Eat like a true Roman',                 'Learn to make fresh cacio e pepe and carbonara from scratch in a Roman home kitchen — then devour your work.', ${regionMap['Rome, Italy']},      '{}', 'food',         4.85, NOW(), NOW()),
            ('Trastevere Food Walk',        'Rome''s tastiest neighbourhood',         'An evening street food tour through the cobblestone alleys of Trastevere sampling supplì, pizza al taglio.', ${regionMap['Rome, Italy']},      '{}', 'food',         4.80, NOW(), NOW()),
            ('Trevi Fountain & Piazzas Walk','Toss a coin for good luck',            'Guided walking tour of Rome''s most beautiful piazzas — Trevi, Navona, and Campo de'' Fiori.',                ${regionMap['Rome, Italy']},      '{}', 'sightseeing',  4.75, NOW(), NOW()),
            ('Borghese Gallery Tour',       'Bernini''s sculptures up close',        'Timed-entry guided tour of one of the world''s finest art galleries — Raphael, Caravaggio, and Bernini.',     ${regionMap['Rome, Italy']},      '{}', 'cultural',     4.82, NOW(), NOW()),
            ('Roman Catacombs Tour',        'Descend beneath the eternal city',      'A guided tour of the ancient underground burial chambers on the Appian Way, stretching for miles beneath Rome.',${regionMap['Rome, Italy']},     '{}', 'cultural',     4.70, NOW(), NOW()),

            -- Dubai, UAE
            ('Burj Khalifa At the Top',     'Touch the sky at 828 m',               'Visit the observation decks of the world''s tallest building for a 360° view across the desert and Gulf.',    ${regionMap['Dubai, UAE']},       '{}', 'sightseeing',  4.85, NOW(), NOW()),
            ('Desert Safari & BBQ',         'Dune bash, camel ride, and stars',      'Thrilling 4x4 dune bashing, camel riding, sandboarding, and a live BBQ dinner under the Arabian stars.',      ${regionMap['Dubai, UAE']},       '{}', 'adventure',    4.88, NOW(), NOW()),
            ('Dubai Creek Dhow Cruise',     'Glide past old and new Dubai',          'Traditional wooden dhow cruise along Dubai Creek with live entertainment, dinner, and city light views.',      ${regionMap['Dubai, UAE']},       '{}', 'relaxation',   4.72, NOW(), NOW()),
            ('Ski Dubai',                   'Ski in the middle of the desert',       'Hit the slopes at Ski Dubai — an indoor ski resort inside the Mall of the Emirates with real snow.',          ${regionMap['Dubai, UAE']},       '{}', 'sports',       4.65, NOW(), NOW()),
            ('Gold & Spice Souk Tour',      'Shop where traders have for centuries', 'Explore Dubai''s iconic Gold Souk with thousands of jewellery displays and the aromatic Spice Souk nearby.',  ${regionMap['Dubai, UAE']},       '{}', 'cultural',     4.60, NOW(), NOW()),
            ('Skydiving over Palm Jumeirah','Freefall with a view of a lifetime',    'Tandem skydive from 4,000 m with a breathtaking bird''s-eye view of the iconic Palm Jumeirah island.',        ${regionMap['Dubai, UAE']},       '{}', 'adventure',    4.90, NOW(), NOW()),
            ('Dubai Frame Visit',           'Stand between old and new Dubai',       'Visit the 150 m picture-frame shaped landmark with a glass bridge walkway and panoramic city views.',          ${regionMap['Dubai, UAE']},       '{}', 'sightseeing',  4.68, NOW(), NOW()),
            ('Luxury Yacht Charter',        'Cruise the Arabian Gulf in style',      'Private or shared yacht cruise along Dubai''s coastline with views of Atlantis, the Burj Al Arab, and beyond.',${regionMap['Dubai, UAE']},       '{}', 'relaxation',   4.80, NOW(), NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const regionNames = [
            'Paris, France', 'Bali, Indonesia', 'Tokyo, Japan', 'New York, USA',
            'Santorini, Greece', 'Nairobi, Kenya', 'Barcelona, Spain', 'Maldives',
            'Rajasthan, India', 'Patagonia, Chile', 'Rome, Italy', 'Dubai, UAE',
        ];

        const placeholders = regionNames.map((_, i) => `$${i + 1}`).join(', ');

        await queryRunner.query(
            `DELETE FROM activities WHERE region_id IN (
                SELECT id FROM regions WHERE name IN (${placeholders})
            )`,
            regionNames,
        );

        await queryRunner.query(
            `DELETE FROM regions WHERE name IN (${placeholders})`,
            regionNames,
        );
    }
}
