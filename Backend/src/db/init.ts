import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  connectionTimeoutMillis: 5000,
});

// Helper function to query the database
async function dbQuery(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDb() {
  
  // Initialize Database Tables
 
  const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        image_url TEXT,
        tags TEXT[],
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);`,
      `CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);`,
      `CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        expiry_date TEXT,
        priority TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);`,
      `CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT[],
        process TEXT,
        contact_info TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS leadership (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT,
        photo TEXT,
        biography TEXT,
        responsibilities TEXT[],
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS mayoral_history (
        id SERIAL PRIMARY KEY,
        mayor_name TEXT NOT NULL,
        photo TEXT,
        term TEXT,
        summary TEXT,
        detailed_description TEXT,
        stakeholders TEXT[],
        achievements TEXT[],
        challenges TEXT[],
        kpis TEXT[],
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS initiatives (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT,
        current_status TEXT,
        timeline TEXT,
        impact TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT,
        description TEXT,
        category TEXT,
        image TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        date TEXT,
        file_url TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS tourism (
        id SERIAL PRIMARY KEY,
        attraction_name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        images TEXT[],
        category TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS blog (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        category TEXT,
        content TEXT,
        featured_image TEXT,
        tags TEXT[],
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE INDEX IF NOT EXISTS idx_blog_status ON blog(status);`,
      `CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        type TEXT,
        category TEXT,
        alt_text TEXT,
        size TEXT,
        mime_type TEXT,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS hero_video (
        id SERIAL PRIMARY KEY,
        video_url TEXT,
        fallback_image TEXT,
        autoplay BOOLEAN DEFAULT TRUE,
        mute BOOLEAN DEFAULT TRUE,
        loop BOOLEAN DEFAULT TRUE,
        show_overlay BOOLEAN DEFAULT TRUE,
        overlay_style TEXT,
        overlay_opacity TEXT,
        title TEXT,
        subtitle TEXT,
        cta_text TEXT,
        cta_link TEXT,
        video_quality TEXT,
        low_bandwidth_mode BOOLEAN DEFAULT FALSE,
        lazy_load BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name TEXT,
        site_description TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        address TEXT,
        social_links JSONB,
        logo_url TEXT,
        favicon_url TEXT,
        footer_text TEXT,
        about_us TEXT,
        mayors_message TEXT,
        mayors_message_author TEXT,
        mayors_message_photo TEXT,
        vision TEXT,
        mission TEXT,
        mandate TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id TEXT,
        user_name TEXT,
        username TEXT,
        action TEXT,
        module TEXT,
        item_id TEXT,
        content_type TEXT,
        content_id TEXT,
        content_title TEXT,
        details TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
        token TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE
      );`,
      `CREATE TABLE IF NOT EXISTS administrative_units (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        members JSONB DEFAULT '[]'::jsonb,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS permits (
        id TEXT PRIMARY KEY,
        applicant_name TEXT NOT NULL,
        license_type TEXT NOT NULL,
        submission_date TEXT,
        target_decision_date TEXT,
        status_gate TEXT DEFAULT 'In Review',
        completion_percentage INTEGER DEFAULT 0,
        assigned_desk TEXT,
        audit_logs JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        detailed_body TEXT NOT NULL,
        location_woreda TEXT NOT NULL,
        votes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Received',
        dispatch_note TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        sector_title TEXT NOT NULL,
        weight_allocation INTEGER DEFAULT 0,
        approved_capital_expense_etb BIGINT DEFAULT 0,
        assigned_project TEXT,
        active_milestone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS tourism_packages (
        id TEXT PRIMARY KEY,
        theme TEXT NOT NULL,
        title TEXT NOT NULL,
        curator_subtitle TEXT,
        seasonality TEXT,
        climate_details TEXT,
        stops JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS growth_metrics (
        id SERIAL PRIMARY KEY,
        year INTEGER UNIQUE NOT NULL,
        population BIGINT NOT NULL,
        growth_rate NUMERIC(5,2) NOT NULL,
        revenue NUMERIC(15,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS dynamic_schemas (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        schema_definition JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS dynamic_content (
        id SERIAL PRIMARY KEY,
        schema_name TEXT NOT NULL REFERENCES dynamic_schemas(name) ON DELETE CASCADE,
        data JSONB NOT NULL,
        status TEXT DEFAULT 'draft',
        language TEXT DEFAULT 'en',
        author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_us TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS mayors_message TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS mayors_message_author TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS mayors_message_photo TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS vision TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS mission TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS mandate TEXT;`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS established TEXT DEFAULT '1924 GC';`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS area TEXT DEFAULT '58,109 ha';`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS altitude TEXT DEFAULT '1,712 m asl';`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS administrative_structure TEXT DEFAULT '32 Sectors, 6 Sub-Cities, 19 Woredas';`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS avg_climate TEXT DEFAULT '22°C';`,
      `ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS population TEXT DEFAULT '1M+';`,
      `ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_title TEXT;`,
      `ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_description TEXT;`,
      `ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`,
      `ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_title TEXT;`,
      `ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_description TEXT;`,
      `ALTER TABLE blog ADD COLUMN IF NOT EXISTS meta_keywords TEXT;`,
      `ALTER TABLE blog ADD COLUMN IF NOT EXISTS slug TEXT;`,
      `ALTER TABLE tourism ADD COLUMN IF NOT EXISTS slug TEXT;`,
      `ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS slug TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;`
    ];

    try {
    for (const query of queries) {
      await dbQuery(query);
    }
    console.log('All database tables and indexes are ready');
          // ========== ADD MISSING COLUMNS TO ADMINISTRATIVE_UNITS ==========
    await dbQuery(`ALTER TABLE administrative_units ADD COLUMN IF NOT EXISTS parent_unit TEXT`);
    await dbQuery(`ALTER TABLE administrative_units ADD COLUMN IF NOT EXISTS office_location TEXT`);
    await dbQuery(`ALTER TABLE administrative_units ADD COLUMN IF NOT EXISTS contact_phone TEXT`);
    await dbQuery(`ALTER TABLE administrative_units ADD COLUMN IF NOT EXISTS delegation_code TEXT`);
    await dbQuery(`ALTER TABLE administrative_units ADD COLUMN IF NOT EXISTS sector_hierarchy TEXT`);

    // ========== SEED ADMINISTRATIVE UNITS (SAFE) ==========
    const adminUnitsCheck = await dbQuery('SELECT id FROM administrative_units LIMIT 1');
    if (adminUnitsCheck.rows.length === 0) {
      //  Insert a safe default unit with valid JSON for `members`
      await dbQuery(`
        INSERT INTO administrative_units 
          (name, type, description, members, status, language, author, parent_unit, office_location, contact_phone, delegation_code, sector_hierarchy)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        'Infrastructure & Urban Dev Sector',
        'Sector',
        'Responsible for municipal physical development, smart expressway hookups, and commercial zoning projects.',
        '[]',                         //  valid empty JSON array
        'published',
        'en',
        'system',
        'City Administration',
        'Block A, 3rd Floor',
        '+251 22 111 2222',
        'INF-001',
        'Infrastructure'
      ]);
      console.log(' Default administrative unit seeded');
    }
      // Seed admin user if empty
      const userCheck = await dbQuery('SELECT id FROM users LIMIT 1');
      if (userCheck.rows.length === 0) {
        const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
        const hash = await bcrypt.hash(defaultPass, 10);
        
        // Super Admin
        await dbQuery('INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', 
          ['superadmin', 'Super Administrator', 'superadmin@adama.gov.et', hash, 'super_admin']);
        
        // Regular Admin
        await dbQuery('INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', 
          ['admin', 'System Admin', 'admin@adama.gov.et', hash, 'admin']);
        
        // Editor
        await dbQuery('INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', 
          ['editor', 'Content Editor', 'editor@adama.gov.et', hash, 'editor']);
        
        // Publisher
        await dbQuery('INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', 
          ['publisher', 'Content Publisher', 'publisher@adama.gov.et', hash, 'publisher']);
          
        // Viewer
        await dbQuery('INSERT INTO users (username, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)', 
          ['viewer', 'Citizen Viewer', 'viewer@adama.gov.et', hash, 'viewer']);
          
        console.log('Role-based default users seeded successfully');
      }

      // Seed permits if empty
      const permitsCheck = await dbQuery('SELECT id FROM permits LIMIT 1');
      if (permitsCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO permits (id, applicant_name, license_type, submission_date, target_decision_date, status_gate, completion_percentage, assigned_desk, audit_logs)
          VALUES 
          ('AD-2026-1042', 'Oromia Industrial Core PLC', 'Commercial Construction', '2026-04-12', '2026-06-01', 'Zoning Audit', 65, 'Central Infrastructure Office (Desk 3)', '[{"id": "1", "date": "2026-04-12", "stageDescription": "Docket initialized successfully", "statusFlag": "Pending"}, {"id": "2", "date": "2026-04-15", "stageDescription": "Structural design approved", "statusFlag": "Approved"}, {"id": "3", "date": "2026-05-10", "stageDescription": "Zoning review pending regional signoff", "statusFlag": "Warning"}]'::jsonb),
          ('AD-2026-2104', 'Sodere Geothermal Power Co.', 'Solar Wind Installation', '2026-05-01', '2026-06-25', 'Field Inspection', 45, 'Renewable Power Desk (Desk A)', '[{"id": "1", "date": "2026-05-01", "stageDescription": "Solar installation clearance opened", "statusFlag": "Pending"}, {"id": "2", "date": "2026-05-04", "stageDescription": "Grid capacity validation complete", "statusFlag": "Approved"}]'::jsonb)`);
        console.log('Default permits seeded');
      }

      // Seed tickets if empty
      const ticketsCheck = await dbQuery('SELECT id FROM tickets LIMIT 1');
      if (ticketsCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO tickets (id, category, summary, detailed_body, location_woreda, votes, status, dispatch_note)
          VALUES
          ('TK-1002', 'Infrastructure', 'Crater pothole on Ring Road highway corridor', 'A deep pothole has expanded significantly on the southbound lane of the Adama Ring Road near Kebele 12. Extremely dangerous at night where there is low visibility.', 'Woreda 03 - Adama South', 48, 'In Progress', 'Assigned crew 4 for asphalt repair. Scheduled for Friday midnight to ease traffic bottlenecks.'),
          ('TK-2091', 'Utilities', 'Water pressure fluctuation in Kebele 08 residential block', 'Multiple households report zero water pressure during peak hours between 6 AM and 9 AM. Likely a geothermal pump calibration issue.', 'Woreda 01 - Kebele 08', 12, 'Assigned', 'Hydrology technician dispatched to verify main pipe branch valve calibration.'),
          ('TK-3921', 'Safety', 'Inoperable solar street lamp grids', 'Three solar street light clusters along the wellness hotspring boulevard are completely unlit, posing security issues during dusk.', 'Woreda 04 - East Thermal Zone', 35, 'Received', '')`);
        console.log('Default tickets seeded');
      }

      // Seed budgets if empty
      const budgetsCheck = await dbQuery('SELECT id FROM budgets LIMIT 1');
      if (budgetsCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO budgets (id, sector_title, weight_allocation, approved_capital_expense_etb, assigned_project, active_milestone)
          VALUES
          ('1', 'Roads & Highway Infrastructure', 35, 4500000000, 'Ring Road Highway Overpass', 'Phase II Paving'),
          ('2', 'Smart City & Digital Integration', 20, 2200000000, 'Broadband Core & Fiber ring', 'Server Farm Rigged'),
          ('3', 'Water & Sewerage Systems', 15, 1800000000, 'Awash Deep Borehole Aquifers', 'Excavation 75%'),
          ('4', 'Thermal Hot Springs & Leisure', 15, 1500000000, 'Sodere Recreation Retrofits', 'Geothermal Outlets Plumbed'),
          ('5', 'Civic Schools & Medical Hubs', 15, 1200000000, 'Woreda 03 Pediatric Wing Expansion', 'Framing Completed')`);
        console.log('Default budgets seeded');
      }

      // Seed packages if empty
      const packagesCheck = await dbQuery('SELECT id FROM tourism_packages LIMIT 1');
      if (packagesCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO tourism_packages (id, theme, title, curator_subtitle, seasonality, climate_details, stops)
          VALUES
          ('TR-101', 'wellness', 'Adama Geothermal Healing & Springs Day', 'Wellness Curators • Ministry of Medical Tourism', 'Excellent Year-Round', '25°C Average, Warm Geothermal Breezes', '[{"id": "s1", "timeOfDay": "08:30 AM", "activityTitle": "Morning Dip in Sodere Deep Hot Springs", "geoLocation": "Sodere Wells complex, Adama", "description": "Soak in the natural 40°C thermal mineral pools to soothe fatigue, joint pressure, and boost skin revitalization.", "curatorTip": "Tip: Refrain from full immersion over 45 mins. Hydrate with natural coconut water post-soak."}, {"id": "s2", "timeOfDay": "12:00 PM", "activityTitle": "Organic Al Fresco Ethio-Mediterranean Lunch", "geoLocation": "Rift Valley Resort Lawn", "description": "Taste localized grilled tilapia harvested sustainably, paired with whole organic grains and specialty herbs.", "curatorTip": "Tip: Sit by the terrace overlooking the Awash River bend for glimpses of resident colobus monkeys."}]'::jsonb),
          ('TR-202', 'culture', 'Oromo Heritage & Culinary Walk', 'Sociology & Cultural Arts Council of Adama', 'Dry Season Preferred', '27°C, Sunny and Clear Skies', '[{"id": "c1", "timeOfDay": "10:00 AM", "activityTitle": "Gada Community Center Guided Exhibit", "geoLocation": "Adama Central Boulevard", "description": "Immersive guide on Oromo democratic history, Gada social assemblies, and traditional handcraft woven artifacts.", "curatorTip": "Tip: Photography is allowed inside the main assembly hall. Ask the curator about the Oda symbolic Sycamore tree."}]'::jsonb)`);
        console.log('Default packages seeded');
      }

      // Seed singletons if empty
      const heroCheck = await dbQuery('SELECT id FROM hero_video LIMIT 1');
      if (heroCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO hero_video (title, subtitle, cta_text, cta_link) VALUES ('Welcome to Adama', 'The Heart of Ethiopia', 'Explore', '#')`);
      }
      
      const settingsCheck = await dbQuery('SELECT id FROM site_settings LIMIT 1');
      if (settingsCheck.rowCount === 0) {
        await dbQuery(`INSERT INTO site_settings (
          site_name, 
          contact_email, 
          about_us, 
          mayors_message, 
          mayors_message_author, 
          mayors_message_photo,
          established,
          area,
          altitude,
          administrative_structure,
          avg_climate,
          population,
          vision,
          mission,
          mandate
        ) VALUES (
          'Adama City', 
          'info@adama.gov.et',
          '<p class="text-lg text-slate-700 leading-relaxed font-semibold">Adama is one of the most prominent, rapidly expanding industrial and cultural metropolitan hubs in the East African Rift Valley.</p><p>Known for its pleasant climate, natural therapeutic hot springs, wind farms, and strategic position along the main transit corridor connecting Addis Ababa to the Red Sea port of Djibouti, Adama represents the progressive heart of the Oromia region.</p><p>The city administration is committed to implementing cutting-edge smart city resources, digital municipal integrations, and high-quality educational corridors. We welcome residents, digital nomads, and global industrial investors to explore our vibrant culture, innovative infrastructure, and warm community.</p>',
          '<p>As the Mayor of Adama, it is my distinct honor to welcome you to our official civic portal. Our city is undergoing an epochal digital and physical transformation.</p><p>Through integrated smart governance, sustainable renewable power, therapeutic thermal leisure development, and robust educational systems, we aim to elevate the quality of life for every citizen.</p>',
          'Hon. Mayor Hailu Jelde',
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
          '1924 GC',
          '58,109 ha',
          '1,712 m asl',
          '32 Sectors, 6 Sub-Cities, 19 Woredas',
          '22°C',
          '1M+',
          'To transform Adama into a highly sustainable, self-reliant, digitally integrated smart metropolis in East Africa, fostering industrial innovation, robust green infrastructure, and a high standard of life for all residents by 2030.',
          'To deliver exceptional municipal services, modernize administrative operations, safeguard social welfare, and construct reliable systems that empower businesses, residents, and visitors in Oromia.',
          'Execute municipal policies, supervise legal and developmental compliances across sub-cities and woredas, coordinate infrastructure, and manage public resources with transparent, data-driven governance.'
        )`);
      } else {
        // Back-populate existing singleton row with initial defaults if empty
        await dbQuery(`UPDATE site_settings SET 
          about_us = COALESCE(about_us, '<p class="text-lg text-slate-700 leading-relaxed font-semibold">Adama is one of the most prominent, rapidly expanding industrial and cultural metropolitan hubs in the East African Rift Valley.</p><p>Known for its pleasant climate, natural therapeutic hot springs, wind farms, and strategic position along the main transit corridor connecting Addis Ababa to the Red Sea port of Djibouti, Adama represents the progressive heart of the Oromia region.</p><p>The city administration is committed to implementing cutting-edge smart city resources, digital municipal integrations, and high-quality educational corridors. We welcome residents, digital nomads, and global industrial investors to explore our vibrant culture, innovative infrastructure, and warm community.</p>'),
          mayors_message = COALESCE(mayors_message, '<p>As the Mayor of Adama, it is my distinct honor to welcome you to our official civic portal. Our city is undergoing an epochal digital and physical transformation.</p><p>Through integrated smart governance, sustainable renewable power, therapeutic thermal leisure development, and robust educational systems, we aim to elevate the quality of life for every citizen.</p>'),
          mayors_message_author = COALESCE(mayors_message_author, 'Hon. Mayor Hailu Jelde'),
          mayors_message_photo = COALESCE(mayors_message_photo, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'),
          established = COALESCE(established, '1924 GC'),
          area = COALESCE(area, '58,109 ha'),
          altitude = COALESCE(altitude, '1,712 m asl'),
          administrative_structure = COALESCE(administrative_structure, '32 Sectors, 6 Sub-Cities, 19 Woredas'),
          avg_climate = COALESCE(avg_climate, '22°C'),
          population = COALESCE(population, '1M+'),
          vision = COALESCE(vision, 'To transform Adama into a highly sustainable, self-reliant, digitally integrated smart metropolis in East Africa, fostering industrial innovation, robust green infrastructure, and a high standard of life for all residents by 2030.'),
          mission = COALESCE(mission, 'To deliver exceptional municipal services, modernize administrative operations, safeguard social welfare, and construct reliable systems that empower businesses, residents, and visitors in Oromia.'),
          mandate = COALESCE(mandate, 'Execute municipal policies, supervise legal and developmental compliances across sub-cities and woredas, coordinate infrastructure, and manage public resources with transparent, data-driven governance.')
          WHERE id = 1 OR TRUE`);
      }

      // Seed growth metrics if empty
      const metricsCheck = await dbQuery('SELECT id FROM growth_metrics LIMIT 1');
      if (metricsCheck.rows.length === 0) {
        await dbQuery(`INSERT INTO growth_metrics (year, population, growth_rate, revenue) VALUES
          (2020, 820000, 2.10, 45000000),
          (2021, 845000, 3.05, 49200500),
          (2022, 878000, 3.90, 54100000),
          (2023, 915000, 4.21, 61500000),
          (2024, 960000, 4.92, 69800000),
          (2025, 1012000, 5.42, 78500000)`);
        console.log('Default growth metrics seeded successfully');
      }
    } catch (err) {
      console.error('Error initializing database tables:', err);
    }
  };