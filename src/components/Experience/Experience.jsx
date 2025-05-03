import React from 'react';
import './Experience.css';

const experiences = [
  {
    title: 'Integrations Support Engineer',
    company: 'Further',
    date: 'Oct 2024 – Present',
    bullets: [
      'Lead custom software integrations between internal platforms and client systems.',
      'Daily use of JavaScript, CSS, and Python to troubleshoot and build tools for support.',
      'Regularly work with Twilio, Postman, and Snowflake to diagnose and solve complex issues.',
      'Collaborate closely with product and engineering teams to refine integration strategy.',
    ],
  },
  {
    title: 'Senior Solutions / Front-End Engineer',
    company: 'TripleLift',
    date: 'Mar 2017 – Present',
    bullets: [
      'Grew a team of support engineers from two people to over 20 specialists.',
      'Built internal applications using React, JavaScript, and TypeScript.',
      'Wrote new endpoints for programmatic APIs and migrated apps to GraphQL/Java.',
      'Led Looker integration for business intelligence.',
      'Resolved major issues via software patches and analytics.',
    ],
  },
  {
    title: 'Senior Product Support Specialist',
    company: 'StreetEasy / Zillow',
    date: 'Dec 2012 – Dec 2014',
    bullets: [
      'Managed high-volume technical support requests from real estate professionals.',
      'Acted as a liaison between support, product, and engineering teams.',
      'Self-taught Ruby on Rails, MySQL, and git version control.',
    ],
  },
  {
    title: 'News Producer',
    company: 'RTVi / Overseas Media Networks Inc',
    date: 'Jun 2011 – Jul 2012',
    bullets: [
      'Produced breaking news segments and organized film shoots in NYC.',
      'Served as a Russian interpreter for the crew.',
    ],
  },
];

const Experience = () => (
	<section id="experience" className="section">
		<div className="experience-container">
				<h2 className="experience-header">Experience</h2>
				{experiences.map((job, idx) => (
				<div className="job-card" key={idx}>
						<div className="job-title">
						{job.title} <span className="job-company">| {job.company}</span>
						</div>
						<div className="job-date">{job.date}</div>
						<ul className="job-bullets">
						{job.bullets.map((point, i) => (
								<li key={i}>{point}</li>
						))}
						</ul>
				</div>
				))}
		</div>
	</section>
);

export default Experience;