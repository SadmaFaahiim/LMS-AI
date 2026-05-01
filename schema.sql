--
-- PostgreSQL database dump
--

\restrict yQatrxgDP6w7paJRadHHIPZs3VmzpQVazdTiB9UkVCmfriH3kehWSdaEshVsZwT

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exam_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_questions (
    exam_id integer NOT NULL,
    question_id integer NOT NULL
);


ALTER TABLE public.exam_questions OWNER TO postgres;

--
-- Name: exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exams (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duration_minutes integer DEFAULT 30 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exams OWNER TO postgres;

--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exams_id_seq OWNER TO postgres;

--
-- Name: exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exams_id_seq OWNED BY public.exams.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    subject_id integer,
    topic_id integer,
    question_text text NOT NULL,
    question_text_en text,
    type character varying(50) NOT NULL,
    difficulty character varying(50) DEFAULT 'medium'::character varying,
    marks integer DEFAULT 1,
    options text,
    answer text,
    answer_bn text,
    explanation text,
    explanation_bn text,
    topic character varying(255),
    subtopic character varying(255),
    hint text,
    source character varying(100) DEFAULT 'ai'::character varying,
    source_reference character varying(255),
    need_evaluation boolean DEFAULT false,
    status character varying(50) DEFAULT 'draft'::character varying,
    is_published boolean DEFAULT false,
    has_figure boolean DEFAULT false,
    has_formula boolean DEFAULT false,
    bloom_level character varying(50),
    metadata text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: submission_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submission_answers (
    id integer NOT NULL,
    submission_id integer,
    question_id integer,
    selected_option text,
    answer_text text,
    is_correct boolean,
    marks_obtained numeric(5,2) DEFAULT 0,
    ai_marks numeric(5,2) DEFAULT 0,
    ai_feedback text
);


ALTER TABLE public.submission_answers OWNER TO postgres;

--
-- Name: submission_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submission_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submission_answers_id_seq OWNER TO postgres;

--
-- Name: submission_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submission_answers_id_seq OWNED BY public.submission_answers.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    exam_id integer,
    student_name character varying(255),
    score numeric(5,2) DEFAULT 0,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp without time zone,
    is_completed boolean DEFAULT false
);


ALTER TABLE public.submissions OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submissions_id_seq OWNER TO postgres;

--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    subject_id integer,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: submission_answers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_answers ALTER COLUMN id SET DEFAULT nextval('public.submission_answers_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Data for Name: exam_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_questions (exam_id, question_id) FROM stdin;
1	3
1	2
1	1
2	8
2	7
2	6
2	5
2	4
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exams (id, title, description, duration_minutes, created_at, updated_at) FROM stdin;
1	Physics Test Exam	For Testing Purpose	1	2026-05-02 01:58:26.86504	2026-05-02 01:58:26.86504
2	physics -2	testing purpose	3	2026-05-02 02:37:07.88727	2026-05-02 02:37:07.88727
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (id, subject_id, topic_id, question_text, question_text_en, type, difficulty, marks, options, answer, answer_bn, explanation, explanation_bn, topic, subtopic, hint, source, source_reference, need_evaluation, status, is_published, has_figure, has_formula, bloom_level, metadata, created_at, updated_at) FROM stdin;
1	1	1	ক্ষমতা লেন্সের সংজ্ঞা কী?	What is the definition of power of a lens?	mcq	medium	1	["একটি লেন্সের ক্ষমতা হলো এর ফোকাল লength","একটি লেন্সের ক্ষমতা হলো এর ফোকাল লength এর ব্যস্তরাশি","একটি লেন্সের ক্ষমতা হলো এর আকারের উপর নির্ভরশীল","একটি লেন্সের ক্ষমতা হলো এর উপাদানের উপর নির্ভরশীল"]	b	একটি লেন্সের ক্ষমতা হলো এর ফোকাল লength এর ব্যস্তরাশি	The power of a lens is defined as the reciprocal of its focal length. It is a measure of the lens's ability to converge or diverge light rays.	লেন্সের ক্ষমতা হলো এর ফোকাল লength এর ব্যস্তরাশি। এটি লেন্সের আলোক রশ্মিকে অভিসারী বা অপসারী করার ক্ষমতার একটি পরিমাপ।	Lens power and diapolar	\N	Think about the relationship between a lens's focal length and its power.	ai	textbook	f	draft	f	f	f	remember	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"medium","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 01:56:39.920035	2026-05-02 01:56:39.920035
2	1	1	একটি লেন্সের ক্ষমতা 2 ডাইঅপ্টার হলে, এর ফোকাল লength কত?	If the power of a lens is 2 diopters, what is its focal length?	mcq	medium	1	["0.5 মিটার","1 মিটার","0.5 সেন্টিমিটার","2 মিটার"]	a	0.5 মিটার	The power of a lens is given by P = 1/f, where f is the focal length in meters. If P = 2 diopters, then f = 1/2 = 0.5 meters.	লেন্সের ক্ষমতা P = 1/f দ্বারা দেওয়া হয়, যেখানে f হলো ফোকাল লength মিটারে। যদি P = 2 ডাইঅপ্টার হয়, তাহলে f = 1/2 = 0.5 মিটার।	Lens power and diapolar	\N	Use the formula for power of a lens to find the focal length.	ai	textbook	f	draft	f	f	f	apply	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"medium","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 01:56:39.925946	2026-05-02 01:56:39.925946
3	1	1	লেন্সের ক্ষমতা নির্ণয়ের জন্য কোন যন্ত্রটি ব্যবহার করা হয়?	Which instrument is used to determine the power of a lens?	mcq	medium	1	["মাইক্রোস্কোপ","টেলিস্কোপ","লেন্সমিটার","স্পেকট্রোস্কোপ"]	c	লেন্সমিটার	A lensmeter is an instrument used to measure the power of a lens. It is commonly used in optometry and ophthalmology.	লেন্সমিটার হলো একটি যন্ত্র যা লেন্সের ক্ষমতা পরিমাপ করতে ব্যবহৃত হয়। এটি সাধারণত অপটোমেট্রি এবং অফথালমোলজিতে ব্যবহৃত হয়।	Lens power and diapolar	\N	Think about the instruments used in optometry and ophthalmology.	ai	textbook	f	draft	f	f	f	remember	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"medium","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 01:56:39.928504	2026-05-02 01:56:39.928504
4	1	1	ক্ষমতা লেন্সের সংজ্ঞা কী?	What is the definition of power of a lens?	mcq	easy	1	["একটি লেন্সের ক্ষমতা হলো এর ফোকাল লength","একটি লেন্সের ক্ষমতা হলো এর ফোকাল লেন্থের ব্যস","একটি লেন্সের ক্ষমতা হলো এর ফোকাল লেন্থের বিপরীত","একটি লেন্সের ক্ষমতা হলো এর আকারের উপর নির্ভরশীল"]	c	একটি লেন্সের ক্ষমতা হলো এর ফোকাল লেন্থের বিপরীত	The power of a lens is defined as the reciprocal of its focal length. It is a measure of the lens's ability to converge or diverge light rays.	একটি লেন্সের ক্ষমতা হলো এর ফোকাল লেন্থের বিপরীত। এটি লেন্সের আলোক রশ্মিকে একত্রিত বা বিচ্ছুরিত করার ক্ষমতার একটি পরিমাপ।	Lens power and diapolar	\N	Think about the relationship between focal length and lens power.	ai	synthesised	f	draft	f	f	f	remember	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"easy","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 02:36:00.894093	2026-05-02 02:36:00.894093
5	1	1	একটি লেন্সের ক্ষমতা কিসের উপর নির্ভরশীল?	On what does the power of a lens depend?	mcq	easy	1	["লেন্সের আকার","লেন্সের ফোকাল লেন্থ","লেন্সের উপাদান","লেন্সের পৃষ্ঠের আকৃতি"]	b	লেন্সের ফোকাল লেন্থ	The power of a lens depends on its focal length. A shorter focal length means a higher power lens.	একটি লেন্সের ক্ষমতা তার ফোকাল লেন্থের উপর নির্ভরশীল। একটি ছোট ফোকাল লেন্থ একটি উচ্চ ক্ষমতা সম্পন্ন লেন্স নির্দেশ করে।	Lens power and diapolar	\N	Consider how lens shape and size affect its power.	ai	synthesised	f	draft	f	f	f	understand	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"easy","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 02:36:00.899457	2026-05-02 02:36:00.899457
6	1	1	একটি লেন্সের ক্ষমতা 2 ডাইপটার হলে, এর ফোকাল লেন্থ কত?	If the power of a lens is 2 diopters, what is its focal length?	mcq	easy	1	["0.5 মিটার","1 মিটার","2 মিটার","0.25 মিটার"]	a	0.5 মিটার	If the power of a lens is 2 diopters, its focal length is 1/2 = 0.5 meters.	যদি একটি লেন্সের ক্ষমতা 2 ডাইপটার হয়, তবে এর ফোকাল লেন্থ 1/2 = 0.5 মিটার।	Lens power and diapolar	\N	Use the formula for lens power: Power = 1/focal length.	ai	synthesised	f	draft	f	f	f	apply	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"easy","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 02:36:00.902985	2026-05-02 02:36:00.902985
7	1	1	কোন লেন্সের ক্ষমতা সবচেয়ে বেশি?	Which lens has the highest power?	mcq	easy	1	["একটি লেন্স যার ফোকাল লেন্থ 0.1 মিটার","একটি লেন্স যার ফোকাল লেন্থ 1 মিটার","একটি লেন্স যার ফোকাল লেন্থ 10 মিটার","একটি লেন্স যার ফোকাল লেন্থ 100 মিটার"]	a	একটি লেন্স যার ফোকাল লেন্থ 0.1 মিটার	The lens with the shortest focal length has the highest power.	সবচেয়ে ছোট ফোকাল লেন্থ বিশিষ্ট লেন্সটির ক্ষমতা সবচেয়ে বেশি।	Lens power and diapolar	\N	Think about the relationship between focal length and lens power.	ai	synthesised	f	draft	f	f	f	analyse	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"easy","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 02:36:00.905957	2026-05-02 02:36:00.905957
8	1	1	লেন্সের ক্ষমতার একক কী?	What is the unit of lens power?	mcq	easy	1	["মিটার","ডাইপটার","নিউটন","জুল"]	b	ডাইপটার	The unit of lens power is diopters (D).	লেন্সের ক্ষমতার একক হলো ডাইপটার (D)।	Lens power and diapolar	\N	Recall the definition of lens power and its unit.	ai	synthesised	f	draft	f	f	f	remember	{"generation_metadata":{"subject":"Physics","topic":"Lens power and diapolar","exam":"HSC","grade":"12","type":"mcq","difficulty":"easy","language":"bn"},"source_exam":"HSC","source_grade":"12"}	2026-05-02 02:36:00.910455	2026-05-02 02:36:00.910455
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, created_at, updated_at) FROM stdin;
1	Lens power and diapolar	2026-05-02 01:56:39.880529	2026-05-02 01:56:39.880529
\.


--
-- Data for Name: submission_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submission_answers (id, submission_id, question_id, selected_option, answer_text, is_correct, marks_obtained, ai_marks, ai_feedback) FROM stdin;
\.


--
-- Data for Name: submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submissions (id, exam_id, student_name, score, started_at, submitted_at, is_completed) FROM stdin;
3	1	Test	0.00	2026-05-02 02:01:17.404345	2026-05-02 02:01:17.404345	t
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topics (id, subject_id, name, created_at, updated_at) FROM stdin;
1	1	Lens power and diapolar	2026-05-02 01:56:39.905545	2026-05-02 01:56:39.905545
\.


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exams_id_seq', 2, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questions_id_seq', 8, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 1, true);


--
-- Name: submission_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submission_answers_id_seq', 1, false);


--
-- Name: submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submissions_id_seq', 5, true);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.topics_id_seq', 1, true);


--
-- Name: exam_questions exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_pkey PRIMARY KEY (exam_id, question_id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_name_key UNIQUE (name);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: submission_answers submission_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: topics topics_subject_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_name_key UNIQUE (subject_id, name);


--
-- Name: exam_questions exam_questions_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_questions exam_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: questions questions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: submission_answers submission_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: submission_answers submission_answers_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_answers
    ADD CONSTRAINT submission_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: submissions submissions_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: topics topics_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- PostgreSQL database dump complete
--

\unrestrict yQatrxgDP6w7paJRadHHIPZs3VmzpQVazdTiB9UkVCmfriH3kehWSdaEshVsZwT

