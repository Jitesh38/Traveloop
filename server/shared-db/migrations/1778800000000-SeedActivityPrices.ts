import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seed realistic price_per_day (USD) for every activity in the system.
 * Prices reflect typical guided-tour / entry-fee rates for each destination.
 */
export class SeedActivityPrices1778800000000 implements MigrationInterface {
    name = 'SeedActivityPrices1778800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const prices: [string, number][] = [
            // ── Paris, France ──────────────────────────────────────────────
            ['Eiffel Tower Visit',               45.00],
            ['Louvre Museum Tour',               35.00],
            ['Seine River Cruise',               25.00],
            ['Montmartre Walking Tour',          30.00],
            ['French Cooking Class',            120.00],
            ['Versailles Day Trip',              65.00],
            ['Paris Wine Tasting',               80.00],

            // ── Bali, Indonesia ────────────────────────────────────────────
            ['Ubud Rice Terrace Trek',           25.00],
            ['Surf Lessons at Kuta',             35.00],
            ['Temple Hopping Tour',              30.00],
            ['Balinese Cooking Class',           45.00],
            ['Mount Batur Sunrise Hike',         55.00],
            ['Spa & Wellness Retreat',           60.00],
            ['Snorkeling at Nusa Penida',        50.00],
            ['White Water Rafting',              40.00],

            // ── Tokyo, Japan ───────────────────────────────────────────────
            ['Tsukiji Outer Market Food Tour',   60.00],
            ['Shibuya Crossing Experience',      20.00],
            ['Samurai Experience',               80.00],
            ['Mount Fuji Day Trip',              75.00],
            ['Zen Meditation Session',           50.00],
            ['Ramen Making Class',               65.00],
            ['Harajuku Street Fashion Tour',     45.00],

            // ── New York, USA ──────────────────────────────────────────────
            ['Statue of Liberty & Ellis Island', 35.00],
            ['Central Park Cycling',             25.00],
            ['Broadway Show',                   120.00],
            ['Brooklyn Food Tour',               55.00],
            ['High Line Walk',                   20.00],
            ['Metropolitan Museum Tour',         40.00],
            ['NYC Helicopter Tour',             200.00],

            // ── Santorini, Greece ──────────────────────────────────────────
            ['Caldera Sunset Viewing',           30.00],
            ['Santorini Wine Tasting',           75.00],
            ['Volcano & Hot Springs Cruise',     55.00],
            ['Oia Village Walk',                 25.00],
            ['Greek Cooking Class',              85.00],
            ['Sea Kayaking',                     50.00],
            ['ATV Island Adventure',             45.00],

            // ── Nairobi, Kenya ─────────────────────────────────────────────
            ['Maasai Mara Safari',              250.00],
            ['Giraffe Centre Visit',             20.00],
            ['David Sheldrick Elephant Orphanage', 25.00],
            ['Hot Air Balloon Safari',          350.00],
            ['Maasai Village Cultural Tour',     40.00],
            ['Bush Camping Experience',         120.00],
            ['Nairobi National Park Drive',      60.00],

            // ── Barcelona, Spain ───────────────────────────────────────────
            ['Sagrada Família Tour',             40.00],
            ['La Boqueria Market Tour',          35.00],
            ['Tapas & Wine Evening Tour',        75.00],
            ['Flamenco Show',                    55.00],
            ['Park Güell Walking Tour',          30.00],
            ['Gothic Quarter Tour',              25.00],
            ['Barceloneta Beach Day',            15.00],

            // ── Maldives ───────────────────────────────────────────────────
            ['Snorkeling with Manta Rays',       80.00],
            ['Underwater Restaurant Dining',    200.00],
            ['Sunset Dolphin Cruise',            60.00],
            ['Scuba Diving',                    100.00],
            ['Private Island Picnic',           300.00],
            ['Traditional Maldivian Fishing',    45.00],
            ['Bioluminescent Beach Walk',        50.00],

            // ── Rajasthan, India ───────────────────────────────────────────
            ['Jaipur Pink City Palace Tour',     25.00],
            ['Thar Desert Camel Safari',         35.00],
            ['Desert Camping',                   80.00],
            ['Block Printing Workshop',          20.00],
            ['Jaisalmer Fort Tour',              20.00],
            ['Ranthambore Tiger Safari',        150.00],
            ['Henna Art Class',                  15.00],
            ['Pushkar Ghats at Sunrise',         10.00],

            // ── Patagonia, Chile ───────────────────────────────────────────
            ['Torres del Paine Trek',           200.00],
            ['Perito Moreno Glacier Walk',      150.00],
            ['Fjord Kayaking',                   80.00],
            ['Wildlife Spotting Tour',           70.00],
            ['Horseback Riding',                 60.00],
            ['Wilderness Camping',               90.00],
            ['Ice Hiking on a Glacier',         120.00],

            // ── Rome, Italy ────────────────────────────────────────────────
            ['Colosseum & Roman Forum Tour',     55.00],
            ['Vatican Museums & Sistine Chapel', 60.00],
            ['Roman Pasta Making Class',         90.00],
            ['Trastevere Food Walk',             50.00],
            ['Trevi Fountain & Piazzas Walk',    30.00],
            ['Borghese Gallery Tour',            45.00],
            ['Roman Catacombs Tour',             35.00],

            // ── Dubai, UAE ─────────────────────────────────────────────────
            ['Burj Khalifa At the Top',          50.00],
            ['Desert Safari & BBQ',              85.00],
            ['Dubai Creek Dhow Cruise',          45.00],
            ['Ski Dubai',                        80.00],
            ['Gold & Spice Souk Tour',           30.00],
            ['Skydiving over Palm Jumeirah',    300.00],
            ['Dubai Frame Visit',                25.00],
            ['Luxury Yacht Charter',            250.00],
        ];

        for (const [name, price] of prices) {
            await queryRunner.query(
                `UPDATE activities SET price_per_day = $1 WHERE name = $2`,
                [price, name],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE activities SET price_per_day = 0`);
    }
}
