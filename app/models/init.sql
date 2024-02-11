CREATE SEQUENCE IF NOT EXISTS my_sequence START 300000;
CREATE TABLE IF NOT EXISTS session (
        id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
        start_date DATE NOT NULL,
        announcement_date DATE NOT NULL,
        lucky_draw_time TIME NOT NULL,
        status TEXT DEFAULT 'inActive',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS participant(
        id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        phone_no BIGINT NOT NULL,
        session_id INT REFERENCES session(id) ON DELETE CASCADE,
         created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- CREATE TABLE IF NOT EXISTS otp (
--         id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
--         email text,
--         otp text,
--         username text,
--         password text,
--         signup_type text,
--         status text,
--         device_id TEXT,
--         created_at TIMESTAMP DEFAULT NOW(),
--         updated_at TIMESTAMP DEFAULT NOW()
-- );
-- CREATE TABLE IF NOT EXISTS lucky_draw (
--         lucky_draw_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
--         start_time text,
--         announcement_date text,
--         duration text,
--            created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()

-- );

CREATE TABLE IF NOT EXISTS winner (
        id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
        participant_id INT REFERENCES participant(id) ON DELETE CASCADE NOT NULL,
        session_id INT REFERENCES session(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stripe (
        stripe_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
        participant_form_id INT NOT NULL,
        status text,
        amount text,
        created_at DATE DEFAULT NOW(),
        updated_at DATE DEFAULT NOW()
);


-- CREATE TABLE IF NOT EXISTS announcement (
--         announcement_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
--         announcement_date DATE,
--         -- created_at DATE DEFAULT NOW(),
--         -- updated_at DATE DEFAULT NOW()
--          created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- CREATE TABLE IF NOT EXISTS participant_form (
--         participant_form_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
--         name text NOT NULL,
--         email text NOT NULL,
--         passport text,
--         referral_code text,
--         -- created_at DATE DEFAULT NOW(),
--         -- updated_at DATE DEFAULT NOW()
--          created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

CREATE TABLE IF NOT EXISTS admin (
        admin_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
        email TEXT ,
        user_name TEXT,
        password TEXT ,
        image text,
        created_at DATE DEFAULT NOW(),
        updated_at DATE DEFAULT NOW()
);