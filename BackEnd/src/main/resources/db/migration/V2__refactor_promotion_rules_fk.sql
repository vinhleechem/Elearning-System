-- Thêm cột course_id và category_id thay thế target_id
ALTER TABLE promotion_rules
    ADD COLUMN course_id BIGINT NULL,
    ADD COLUMN category_id BIGINT NULL;

-- Migrate data cũ: nếu rule_type = 'COURSE' thì copy target_id sang course_id
UPDATE promotion_rules SET course_id = target_id WHERE rule_type = 'COURSE';

-- Nếu rule_type = 'CATEGORY' thì copy target_id sang category_id
UPDATE promotion_rules SET category_id = target_id WHERE rule_type = 'CATEGORY';

-- Thêm FK constraints
ALTER TABLE promotion_rules
    ADD CONSTRAINT fk_promotion_rules_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL;

ALTER TABLE promotion_rules
    ADD CONSTRAINT fk_promotion_rules_category
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Xóa cột target_id cũ
ALTER TABLE promotion_rules DROP COLUMN target_id;
