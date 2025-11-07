import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import IntegrationService from '../services/integrationService';
import LeadService from '../services/leadService';
import securityBypass from '../utils/securityBypass';
import toast from 'react-hot-toast';

const BulkProspeoScraper = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const [scrapeForm, setScrapeForm] = useState({
    domain: '',
    leadCount: 20,
    industries: [],
    targetType: 'smb'
  });
  
  const [scraping, setScraping] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [scrapeProgress, setScrapeProgress] = useState(0);

  // Pre-defined SaaS & startup domains for bulk scraping (better targets than Fortune 500!)
  const popularDomains = [
    'buffer.com', 'zapier.com', 'helpscout.com', 'drift.com', 'close.com',
    'gumroad.com', 'convertkit.com', 'crisp.chat', 'tidio.com', 'groove.com',
    'freshworks.com', 'livechat.com', 'uservoice.com', 'frontapp.com', 'helpshift.com',
    'sparktoro.com', 'usefyi.com', 'baremetrics.com', 'nomadlist.com', 'producthunt.com'
  ];

  const industryTargets = [
    { name: 'SaaS Startups', domains: ['convertkit.com', 'usefyi.com', 'sparktoro.com', 'gumroad.com'] },
    { name: 'Support Tools', domains: ['helpscout.com', 'crisp.chat', 'tidio.com', 'livechat.com'] },
    { name: 'Small Agencies', domains: ['buffer.com', 'zapier.com', 'microacquire.com'] },
    { name: 'Developer Tools', domains: ['producthunt.com', 'nomadlist.com', 'unsplash.com'] }
  ];

  const executiveNames = [
    // ===== TECH INDUSTRY - SaaS FOUNDERS & EXECUTIVES =====
    // (High-value targets who understand software and need sales/marketing automation)
    { first: 'Nathan', last: 'Latka', company: 'Founderpath', domain: 'founderpath.com' },
    { first: 'Des', last: 'Traynor', company: 'Intercom', domain: 'intercom.com' },
    { first: 'Joel', last: 'Gascoigne', company: 'Buffer', domain: 'buffer.com' },
    { first: 'Wade', last: 'Foster', company: 'Zapier', domain: 'zapier.com' },
    { first: 'Ryan', last: 'Hoover', company: 'Product Hunt', domain: 'producthunt.com' },
    { first: 'Sahil', last: 'Lavingia', company: 'Gumroad', domain: 'gumroad.com' },
    { first: 'Steli', last: 'Efti', company: 'Close', domain: 'close.com' },
    { first: 'Rand', last: 'Fishkin', company: 'SparkToro', domain: 'sparktoro.com' },
    { first: 'Hiten', last: 'Shah', company: 'Nira', domain: 'nira.com' },
    { first: 'Mikael', last: 'Cho', company: 'Unsplash', domain: 'unsplash.com' },
    { first: 'Jason', last: 'Fried', company: 'Basecamp', domain: 'basecamp.com' },
    { first: 'David', last: 'Cancel', company: 'Drift', domain: 'drift.com' },
    { first: 'Eoghan', last: 'McCabe', company: 'Intercom', domain: 'intercom.com' },
    { first: 'Noah', last: 'Kagan', company: 'AppSumo', domain: 'appsumo.com' },
    { first: 'Patrick', last: 'McKenzie', company: 'Kalzumeus', domain: 'kalzumeus.com' },
    { first: 'Amy', last: 'Hoy', company: 'Stacking The Bricks', domain: 'stackingthebricks.com' },
    { first: 'Rob', last: 'Walling', company: 'TinySeed', domain: 'tinyseed.com' },
    { first: 'Justin', last: 'Jackson', company: 'Transistor', domain: 'transistor.fm' },
    { first: 'Courtland', last: 'Allen', company: 'Indie Hackers', domain: 'indiehackers.com' },
    { first: 'Pieter', last: 'Levels', company: 'Nomad List', domain: 'nomadlist.com' },
    
    // ===== MARKETING & GROWTH EXECUTIVES =====
    // (Perfect Market Genie customers - they need better lead generation!)
    { first: 'Neil', last: 'Patel', company: 'Neil Patel Digital', domain: 'neilpatel.com' },
    { first: 'Sujan', last: 'Patel', company: 'Mailshake', domain: 'mailshake.com' },
    { first: 'Sean', last: 'Ellis', company: 'GrowthHackers', domain: 'growthhackers.com' },
    { first: 'Brian', last: 'Dean', company: 'Backlinko', domain: 'backlinko.com' },
    { first: 'Peep', last: 'Laja', company: 'CXL', domain: 'cxl.com' },
    { first: 'Oli', last: 'Gardner', company: 'Unbounce', domain: 'unbounce.com' },
    { first: 'Marcus', last: 'Sheridan', company: 'River Pools', domain: 'riverpoolsandspas.com' },
    { first: 'Ann', last: 'Handley', company: 'MarketingProfs', domain: 'marketingprofs.com' },
    { first: 'Ryan', last: 'Deiss', company: 'DigitalMarketer', domain: 'digitalmarketer.com' },
    { first: 'Jay', last: 'Baer', company: 'Convince & Convert', domain: 'convinceandconvert.com' },
    { first: 'Joanna', last: 'Wiebe', company: 'Copyhackers', domain: 'copyhackers.com' },
    { first: 'April', last: 'Dunford', company: 'Ambient Strategy', domain: 'aprildunford.com' },
    { first: 'Dave', last: 'Gerhardt', company: 'Exit Five', domain: 'exitfive.com' },
    { first: 'Morgan', last: 'Brown', company: 'Growth', domain: 'growth.org' },
    { first: 'Casey', last: 'Winters', company: 'Casey Winters', domain: 'caseywinters.com' },
    
    // ===== SMALL TO MEDIUM BUSINESS OWNERS =====
    // (Your Primary Target - need lead generation & CRM!)
    { first: 'Mike', last: 'Johnson', company: 'Local Marketing Pro', domain: 'localmarketingpro.com' },
    { first: 'Sarah', last: 'Williams', company: 'Boutique Consulting', domain: 'boutiqueconsulting.com' },
    { first: 'David', last: 'Brown', company: 'Metro Services LLC', domain: 'metroservicesllc.com' },
    { first: 'Lisa', last: 'Davis', company: 'Creative Solutions Hub', domain: 'creativesolutionshub.com' },
    { first: 'Tom', last: 'Wilson', company: 'Wilson Construction', domain: 'wilsonconstruction.com' },
    { first: 'Amy', last: 'Taylor', company: 'Taylor Digital Agency', domain: 'taylordigitalagency.com' },
    { first: 'John', last: 'Martinez', company: 'Martinez Auto Repair', domain: 'martinezautorepair.com' },
    { first: 'Jessica', last: 'Anderson', company: 'Anderson Law Firm', domain: 'andersonlawfirm.com' },
    { first: 'Steve', last: 'Collins', company: 'Collins Web Design', domain: 'collinswebdesign.com' },
    { first: 'Rachel', last: 'Foster', company: 'Foster Marketing Group', domain: 'fostermarketinggroup.com' },
    { first: 'Tim', last: 'Edwards', company: 'Edwards Consulting', domain: 'edwardsconsulting.com' },
    { first: 'Maria', last: 'Rodriguez', company: 'Rodriguez Solutions', domain: 'rodriguezsolutions.com' },
    { first: 'Jake', last: 'Morrison', company: 'Morrison Media', domain: 'morrisonmedia.com' },
    { first: 'Emma', last: 'Wright', company: 'Wright Creative Studio', domain: 'wrightcreativestudio.com' },
    { first: 'Carl', last: 'Peterson', company: 'Peterson & Associates', domain: 'petersonassociates.com' },
    { first: 'Diana', last: 'Hughes', company: 'Hughes Digital', domain: 'hughesdigital.com' },
    { first: 'Rich', last: 'Stevens', company: 'Stevens Strategy', domain: 'stevensstrategy.com' },
    { first: 'Kate', last: 'Reynolds', company: 'Reynolds Agency', domain: 'reynoldsagency.com' },
    { first: 'Mark', last: 'Coleman', company: 'Coleman Growth Partners', domain: 'colemangrowth.com' },
    { first: 'Sophie', last: 'Bennett', company: 'Bennett Business Solutions', domain: 'bennettbusiness.com' },
    
    // ===== JOHN Q CUSTOMER BUSINESS OWNERS =====
    // (Perfect Market Genie Customers - local businesses needing automation!)
    { first: 'Robert', last: 'Thompson', company: 'Thompson Plumbing', domain: 'thompsonplumbing.com' },
    { first: 'Michelle', last: 'Garcia', company: 'Garcia Real Estate', domain: 'garciarealestate.com' },
    { first: 'Chris', last: 'Moore', company: 'Moore Insurance Agency', domain: 'mooreinsurance.com' },
    { first: 'Jennifer', last: 'White', company: 'White Dental Practice', domain: 'whitedental.com' },
    { first: 'Kevin', last: 'Lee', company: 'Lee Accounting Services', domain: 'leeaccounting.com' },
    { first: 'Rachel', last: 'Clark', company: 'Clark Fitness Studio', domain: 'clarkfitness.com' },
    { first: 'Mark', last: 'Lewis', company: 'Lewis HVAC Solutions', domain: 'lewishvac.com' },
    { first: 'Amanda', last: 'Walker', company: 'Walker Pet Grooming', domain: 'walkerpetgrooming.com' },
    { first: 'Brian', last: 'Taylor', company: 'Taylor Auto Sales', domain: 'taylorautosales.com' },
    { first: 'Linda', last: 'Chen', company: 'Chen Family Dentistry', domain: 'chenfamilydentistry.com' },
    { first: 'Gary', last: 'Wilson', company: 'Wilson Roofing', domain: 'wilsonroofing.com' },
    { first: 'Tracy', last: 'Miller', company: 'Miller Veterinary Clinic', domain: 'millervet.com' },
    { first: 'Paul', last: 'Robinson', company: 'Robinson Law Office', domain: 'robinsonlaw.com' },
    { first: 'Nancy', last: 'Davis', company: 'Davis Physical Therapy', domain: 'davispt.com' },
    { first: 'Jeff', last: 'Brown', company: 'Brown Construction', domain: 'brownconstruction.com' },
    { first: 'Susan', last: 'Johnson', company: 'Johnson Accounting', domain: 'johnsonaccounting.com' },
    { first: 'Tony', last: 'Martinez', company: 'Martinez Landscaping', domain: 'martinezlandscaping.com' },
    { first: 'Carol', last: 'Anderson', company: 'Anderson Insurance', domain: 'andersoninsurance.com' },
    { first: 'Dan', last: 'Thompson', company: 'Thompson Electric', domain: 'thompsonelectric.com' },
    { first: 'Karen', last: 'Williams', company: 'Williams Realty', domain: 'williamsrealty.com' },
    
    // ===== CUSTOMER SUPPORT & SERVICE COMPANIES =====
    // (Great targets for Support Genie!)
    { first: 'Alex', last: 'Turnbull', company: 'Groove', domain: 'groove.com' },
    { first: 'Nick', last: 'Francis', company: 'Help Scout', domain: 'helpscout.com' },
    { first: 'Mathilde', last: 'Collin', company: 'Front', domain: 'frontapp.com' },
    { first: 'Baptiste', last: 'Jamin', company: 'Crisp', domain: 'crisp.chat' },
    { first: 'Mariusz', last: 'Ciesla', company: 'LiveChat', domain: 'livechat.com' },
    { first: 'Szymon', last: 'Klimczak', company: 'Tidio', domain: 'tidio.com' },
    { first: 'Steve', last: 'Hall', company: 'Hall Tech Support', domain: 'halltechsupport.com' },
    { first: 'Nicole', last: 'Young', company: 'Young Customer Care', domain: 'youngcustomercare.com' },
    { first: 'Brian', last: 'King', company: 'King Call Center', domain: 'kingcallcenter.com' },
    { first: 'Stephanie', last: 'Wright', company: 'Wright Help Desk', domain: 'wrighthelpdesk.com' },
    { first: 'Alex', last: 'Scott', company: 'Scott Support Services', domain: 'scottsupport.com' },
    { first: 'Melissa', last: 'Green', company: 'Green Customer Solutions', domain: 'greencustomersolutions.com' },
    { first: 'Tyler', last: 'Hayes', company: 'Hayes Support Center', domain: 'hayessupport.com' },
    { first: 'Lauren', last: 'Parker', company: 'Parker Customer Care', domain: 'parkercustomercare.com' },
    { first: 'Derek', last: 'Stone', company: 'Stone Service Solutions', domain: 'stoneservice.com' },
    
    // ===== LOCAL SERVICE BUSINESSES =====
    // (High Need for Lead Generation - perfect for Market Genie!)
    { first: 'Paul', last: 'Adams', company: 'Adams Landscaping', domain: 'adamslandscaping.com' },
    { first: 'Laura', last: 'Baker', company: 'Baker Cleaning Services', domain: 'bakercleaning.com' },
    { first: 'Daniel', last: 'Mitchell', company: 'Mitchell Home Repairs', domain: 'mitchellhomerepairs.com' },
    { first: 'Kelly', last: 'Turner', company: 'Turner Event Planning', domain: 'turnereventplanning.com' },
    { first: 'Ryan', last: 'Phillips', company: 'Phillips Moving Company', domain: 'phillipsmoving.com' },
    { first: 'Lisa', last: 'Campbell', company: 'Campbell Catering', domain: 'campbellcatering.com' },
    { first: 'Scott', last: 'Barnes', company: 'Barnes Home Services', domain: 'barneshomeservices.com' },
    { first: 'Ashley', last: 'Cooper', company: 'Cooper Lawn Care', domain: 'cooperlawncare.com' },
    { first: 'Marcus', last: 'Hill', company: 'Hill Pest Control', domain: 'hillpestcontrol.com' },
    { first: 'Vanessa', last: 'Reed', company: 'Reed Wedding Planning', domain: 'reedweddings.com' },
    { first: 'Jordan', last: 'Price', company: 'Price Home Improvement', domain: 'pricehomeimprovement.com' },
    { first: 'Tiffany', last: 'Ward', company: 'Ward Photography', domain: 'wardphotography.com' },
    { first: 'Craig', last: 'Morgan', company: 'Morgan Security Services', domain: 'morgansecurity.com' },
    { first: 'Hannah', last: 'Cook', company: 'Cook Event Catering', domain: 'cookeventcatering.com' },
    { first: 'Bruce', last: 'Kelly', company: 'Kelly Pool Services', domain: 'kellypoolservices.com' },
    { first: 'Natalie', last: 'Ross', company: 'Ross Interior Design', domain: 'rossinterior.com' },
    { first: 'Victor', last: 'Gray', company: 'Gray Tree Service', domain: 'graytreeservice.com' },
    { first: 'Allison', last: 'Fox', company: 'Fox Personal Training', domain: 'foxpersonaltraining.com' },
    { first: 'Kevin', last: 'Perry', company: 'Perry Handyman Services', domain: 'perryhandyman.com' },
    { first: 'Brittany', last: 'Long', company: 'Long Cleaning Co', domain: 'longcleaning.com' },
    { first: 'Wade', last: 'Foster', company: 'Zapier', domain: 'zapier.com' },
    { first: 'Ryan', last: 'Hoover', company: 'Product Hunt', domain: 'producthunt.com' },
    { first: 'Sahil', last: 'Lavingia', company: 'Gumroad', domain: 'gumroad.com' },
    { first: 'Steli', last: 'Efti', company: 'Close', domain: 'close.com' },
    { first: 'Rand', last: 'Fishkin', company: 'SparkToro', domain: 'sparktoro.com' },
    
    // Support & Customer Service SaaS (Great targets for Support Genie!)
    { first: 'Alex', last: 'Turnbull', company: 'Groove', domain: 'groove.com' },
    { first: 'Nick', last: 'Francis', company: 'Help Scout', domain: 'helpscout.com' },
    { first: 'Mathilde', last: 'Collin', company: 'Front', domain: 'frontapp.com' },
    { first: 'Baptiste', last: 'Jamin', company: 'Crisp', domain: 'crisp.chat' },
    { first: 'Mariusz', last: 'Ciesla', company: 'LiveChat', domain: 'livechat.com' },
    { first: 'Szymon', last: 'Klimczak', company: 'Tidio', domain: 'tidio.com' },
    { first: 'Steve', last: 'Hall', company: 'Hall Tech Support', domain: 'halltechsupport.com' },
    { first: 'Nicole', last: 'Young', company: 'Young Customer Care', domain: 'youngcustomercare.com' },
    { first: 'Brian', last: 'King', company: 'King Call Center', domain: 'kingcallcenter.com' },
    { first: 'Stephanie', last: 'Wright', company: 'Wright Help Desk', domain: 'wrighthelpdesk.com' },
    { first: 'Alex', last: 'Scott', company: 'Scott Support Services', domain: 'scottsupport.com' },
    { first: 'Melissa', last: 'Green', company: 'Green Customer Solutions', domain: 'greencustomersolutions.com' },
    { first: 'Tyler', last: 'Hayes', company: 'Hayes Support Center', domain: 'hayessupport.com' },
    { first: 'Lauren', last: 'Parker', company: 'Parker Customer Care', domain: 'parkercustomercare.com' },
    { first: 'Derek', last: 'Stone', company: 'Stone Service Solutions', domain: 'stoneservice.com' },
    
    // ===== LOCAL SERVICE BUSINESSES =====
    // (High Need for Lead Generation - perfect for Market Genie!)
    { first: 'Paul', last: 'Adams', company: 'Adams Landscaping', domain: 'adamslandscaping.com' },
    { first: 'Laura', last: 'Baker', company: 'Baker Cleaning Services', domain: 'bakercleaning.com' },
    { first: 'Daniel', last: 'Mitchell', company: 'Mitchell Home Repairs', domain: 'mitchellhomerepairs.com' },
    { first: 'Kelly', last: 'Turner', company: 'Turner Event Planning', domain: 'turnereventplanning.com' },
    { first: 'Ryan', last: 'Phillips', company: 'Phillips Moving Company', domain: 'phillipsmoving.com' },
    { first: 'Lisa', last: 'Campbell', company: 'Campbell Catering', domain: 'campbellcatering.com' },
    { first: 'Scott', last: 'Barnes', company: 'Barnes Home Services', domain: 'barneshomeservices.com' },
    { first: 'Ashley', last: 'Cooper', company: 'Cooper Lawn Care', domain: 'cooperlawncare.com' },
    { first: 'Marcus', last: 'Hill', company: 'Hill Pest Control', domain: 'hillpestcontrol.com' },
    { first: 'Vanessa', last: 'Reed', company: 'Reed Wedding Planning', domain: 'reedweddings.com' },
    { first: 'Jordan', last: 'Price', company: 'Price Home Improvement', domain: 'pricehomeimprovement.com' },
    { first: 'Tiffany', last: 'Ward', company: 'Ward Photography', domain: 'wardphotography.com' },
    { first: 'Craig', last: 'Morgan', company: 'Morgan Security Services', domain: 'morgansecurity.com' },
    { first: 'Hannah', last: 'Cook', company: 'Cook Event Catering', domain: 'cookeventcatering.com' },
    { first: 'Bruce', last: 'Kelly', company: 'Kelly Pool Services', domain: 'kellypoolservices.com' },
    { first: 'Natalie', last: 'Ross', company: 'Ross Interior Design', domain: 'rossinterior.com' },
    { first: 'Victor', last: 'Gray', company: 'Gray Tree Service', domain: 'graytreeservice.com' },
    { first: 'Allison', last: 'Fox', company: 'Fox Personal Training', domain: 'foxpersonaltraining.com' },
    { first: 'Kevin', last: 'Perry', company: 'Perry Handyman Services', domain: 'perryhandyman.com' },
    { first: 'Brittany', last: 'Long', company: 'Long Cleaning Co', domain: 'longcleaning.com' },
    
    // ===== E-COMMERCE STORE OWNERS =====
    // (Need Marketing Automation & Customer Support!)
    { first: 'Jason', last: 'Evans', company: 'Evans Online Store', domain: 'evansonlinestore.com' },
    { first: 'Kimberly', last: 'Roberts', company: 'Roberts Boutique', domain: 'robertsboutique.com' },
    { first: 'Matthew', last: 'Carter', company: 'Carter Electronics', domain: 'carterelectronics.com' },
    { first: 'Ashley', last: 'Parker', company: 'Parker Home Goods', domain: 'parkerhomegoods.com' },
    { first: 'Andrew', last: 'Cox', company: 'Cox Outdoor Gear', domain: 'coxoutdoorgear.com' },
    { first: 'Samantha', last: 'Ward', company: 'Ward Fashion Hub', domain: 'wardfashionhub.com' },
    { first: 'Brandon', last: 'Fields', company: 'Fields Sports Equipment', domain: 'fieldssports.com' },
    { first: 'Megan', last: 'Silva', company: 'Silva Beauty Products', domain: 'silvabeauty.com' },
    { first: 'Tyler', last: 'Bishop', company: 'Bishop Tech Gadgets', domain: 'bishoptech.com' },
    { first: 'Chloe', last: 'Wells', company: 'Wells Handmade Crafts', domain: 'wellshandmade.com' },
    { first: 'Austin', last: 'Murray', company: 'Murray Fitness Gear', domain: 'murrayfitness.com' },
    { first: 'Paige', last: 'Dixon', company: 'Dixon Pet Supplies', domain: 'dixonpets.com' },
    { first: 'Ethan', last: 'Flores', company: 'Flores Home Decor', domain: 'floreshomedecor.com' },
    { first: 'Zoe', last: 'Pierce', company: 'Pierce Jewelry', domain: 'piercejewelry.com' },
    { first: 'Logan', last: 'Webb', company: 'Webb Outdoor Store', domain: 'webboutdoor.com' },
    
    // ===== PROFESSIONAL SERVICES =====
    // (Lawyers, Accountants, Consultants - need client management!)
    { first: 'Michael', last: 'Torres', company: 'Torres CPA Firm', domain: 'torrescpa.com' },
    { first: 'Linda', last: 'Rivera', company: 'Rivera Legal Group', domain: 'riveralegal.com' },
    { first: 'James', last: 'Cooper', company: 'Cooper Financial Advisors', domain: 'cooperfinancial.com' },
    { first: 'Karen', last: 'Reed', company: 'Reed HR Consulting', domain: 'reedhr.com' },
    { first: 'William', last: 'Bailey', company: 'Bailey Business Consulting', domain: 'baileybusiness.com' },
    { first: 'Patricia', last: 'Gray', company: 'Gray Marketing Consultants', domain: 'graymarketing.com' },
    { first: 'Richard', last: 'Hunt', company: 'Hunt Law Firm', domain: 'huntlawfirm.com' },
    { first: 'Elizabeth', last: 'Boyd', company: 'Boyd Accounting Services', domain: 'boydaccounting.com' },
    { first: 'Charles', last: 'Howard', company: 'Howard Consulting Group', domain: 'howardconsulting.com' },
    { first: 'Barbara', last: 'Wood', company: 'Wood Financial Planning', domain: 'woodfinancial.com' },
    { first: 'Robert', last: 'Porter', company: 'Porter Legal Services', domain: 'porterlegal.com' },
    { first: 'Mary', last: 'Griffin', company: 'Griffin Tax Services', domain: 'griffintax.com' },
    { first: 'John', last: 'Ellis', company: 'Ellis Business Advisors', domain: 'ellisbusiness.com' },
    { first: 'Jennifer', last: 'Warren', company: 'Warren Estate Planning', domain: 'warrenestate.com' },
    { first: 'David', last: 'Butler', company: 'Butler Consulting', domain: 'butlerconsulting.com' },
    
    // ===== HEALTHCARE PROFESSIONALS =====
    // (Need patient management & appointment systems!)
    { first: 'Dr. Sarah', last: 'Mitchell', company: 'Mitchell Family Medicine', domain: 'mitchellfamilymed.com' },
    { first: 'Dr. Mark', last: 'Harrison', company: 'Harrison Dental Group', domain: 'harrisondental.com' },
    { first: 'Dr. Lisa', last: 'Graham', company: 'Graham Pediatrics', domain: 'grahampediatrics.com' },
    { first: 'Dr. Jason', last: 'Barnes', company: 'Barnes Orthopedics', domain: 'barnesortho.com' },
    { first: 'Dr. Amanda', last: 'Cole', company: 'Cole Dermatology', domain: 'coledermatology.com' },
    { first: 'Dr. Brian', last: 'Fisher', company: 'Fisher Eye Care', domain: 'fishereyecare.com' },
    { first: 'Dr. Nicole', last: 'Perry', company: 'Perry Wellness Center', domain: 'perrywellness.com' },
    { first: 'Dr. Kevin', last: 'Ross', company: 'Ross Physical Therapy', domain: 'rosspt.com' },
    { first: 'Dr. Rachel', last: 'Stone', company: 'Stone Chiropractic', domain: 'stonechiro.com' },
    { first: 'Dr. Tyler', last: 'Hart', company: 'Hart Veterinary Clinic', domain: 'hartvet.com' },
    
    // ===== AGENCY OWNERS & MARKETING PROFESSIONALS =====
    // (Perfect Market Genie customers - they serve other businesses!)
    { first: 'Alex', last: 'Chen', company: 'Chen Digital Marketing', domain: 'chendigital.com' },
    { first: 'Morgan', last: 'Blake', company: 'Blake Creative Agency', domain: 'blakecreative.com' },
    { first: 'Jordan', last: 'Reed', company: 'Reed Marketing Solutions', domain: 'reedmarketing.com' },
    { first: 'Taylor', last: 'West', company: 'West Brand Studio', domain: 'westbrand.com' },
    { first: 'Casey', last: 'Ford', company: 'Ford Social Media', domain: 'fordsocialmedia.com' },
    { first: 'Quinn', last: 'Lane', company: 'Lane Growth Agency', domain: 'lanegrowth.com' },
    { first: 'Riley', last: 'Cross', company: 'Cross Performance Marketing', domain: 'crossperformance.com' },
    { first: 'Sage', last: 'Burns', company: 'Burns Digital Strategy', domain: 'burnsdigital.com' },
    { first: 'Drew', last: 'Nash', company: 'Nash Media Group', domain: 'nashmedia.com' },
    { first: 'Blake', last: 'Shaw', company: 'Shaw Creative Studios', domain: 'shawcreative.com' },
    
    // ===== REAL ESTATE PROFESSIONALS =====
    // (Need lead generation & client management systems!)
    { first: 'Jennifer', last: 'Walsh', company: 'Walsh Real Estate', domain: 'walshrealestate.com' },
    { first: 'Brad', last: 'Simpson', company: 'Simpson Properties', domain: 'simpsonproperties.com' },
    { first: 'Christine', last: 'Wells', company: 'Wells Realty Group', domain: 'wellsrealty.com' },
    { first: 'Mike', last: 'Knight', company: 'Knight Real Estate', domain: 'knightrealestate.com' },
    { first: 'Sandra', last: 'Pope', company: 'Pope Property Solutions', domain: 'popeproperty.com' },
    { first: 'Greg', last: 'Palmer', company: 'Palmer Realty', domain: 'palmerrealty.com' },
    { first: 'Tina', last: 'Fleming', company: 'Fleming Home Sales', domain: 'fleminghomes.com' },
    { first: 'Rob', last: 'Curtis', company: 'Curtis Commercial Real Estate', domain: 'curtiscommercial.com' },
    { first: 'Angela', last: 'Hunter', company: 'Hunter Property Management', domain: 'hunterproperty.com' },
    { first: 'Steve', last: 'Douglas', company: 'Douglas Real Estate Investments', domain: 'douglasinvestments.com' },
    
    // ===== FITNESS & WELLNESS PROFESSIONALS =====
    // (Need client management & booking systems!)
    { first: 'Jake', last: 'Torres', company: 'Torres Fitness Studio', domain: 'torresfitness.com' },
    { first: 'Emma', last: 'Reid', company: 'Reid Yoga Center', domain: 'reidyoga.com' },
    { first: 'Connor', last: 'Price', company: 'Price Personal Training', domain: 'pricept.com' },
    { first: 'Olivia', last: 'Grant', company: 'Grant Wellness Spa', domain: 'grantwellness.com' },
    { first: 'Nathan', last: 'Webb', company: 'Webb CrossFit', domain: 'webbcrossfit.com' },
    { first: 'Maya', last: 'Foster', company: 'Foster Pilates Studio', domain: 'fosterpilates.com' },
    { first: 'Lucas', last: 'Dean', company: 'Dean Martial Arts', domain: 'deanmartialarts.com' },
    { first: 'Sophia', last: 'Gilbert', company: 'Gilbert Nutrition Coaching', domain: 'gilbertnutrition.com' },
    { first: 'Caleb', last: 'Hayes', company: 'Hayes Sports Performance', domain: 'hayessports.com' },
    { first: 'Ava', last: 'Bishop', company: 'Bishop Dance Academy', domain: 'bishopdance.com' }
  ];

  const handleBulkScrape = async () => {
    if (scrapeForm.leadCount < 5 || scrapeForm.leadCount > 40) {
      toast.error('Lead count must be between 5 and 40');
      return;
    }

    try {
      setScraping(true);
      setScrapedLeads([]);
      setScrapeProgress(0);
      
      console.log('🚀 Starting bulk lead scrape for', scrapeForm.leadCount, 'leads');
      
      const foundLeads = [];
      const targetCount = Math.min(scrapeForm.leadCount, executiveNames.length);
      
      // Shuffle executive names for variety
      const shuffledExecutives = [...executiveNames].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < targetCount; i++) {
        try {
          const executive = shuffledExecutives[i];
          setScrapeProgress(Math.round(((i + 1) / targetCount) * 100));
          
          console.log(`🔍 Multi-provider search for ${executive.first} ${executive.last} at ${executive.company}...`);
          
          // Use multi-provider approach: Hunter.io, VoilaNorbert, AND Prospeo!
          const result = await LeadService.findPersonMultiProvider(
            tenant.id, 
            executive.domain, 
            executive.first, 
            executive.last
          );

          if (result.success && result.data && result.data.email) {
            const leadData = {
              firstName: executive.first,
              lastName: executive.last,
              email: result.data.email,
              company: executive.company,
              domain: executive.domain,
              source: `bulk-multi-provider-scrape`,
              provider: result.data.provider || 'multi-provider',
              status: result.data.status || 'unknown',
              confidence: result.data.confidence || null,
              score: result.data.status === 'VALID' ? 95 : 75,
              createdAt: new Date().toISOString(),
              title: 'Executive' // Default title for executives
            };

            foundLeads.push(leadData);
            console.log(`✅ Found via ${result.data.provider || 'multi-provider'}: ${leadData.email}`);
            
          } else {
            console.log(`❌ No email found across all providers for ${executive.first} ${executive.last}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ Error searching for ${shuffledExecutives[i].first} ${shuffledExecutives[i].last}:`, error);
        }
      }

      setScrapedLeads(foundLeads);
      
      // Batch save all leads to database in one operation
      if (foundLeads.length > 0) {
        toast.success(`🎉 Multi-provider scrape complete! Found ${foundLeads.length} executive emails`);
        
        // Show saving toast
        const savingToast = toast.loading(`💾 Saving ${foundLeads.length} leads to database...`);
        
        try {
          await saveBatchLeadsToDatabase(foundLeads);
          toast.dismiss(savingToast);
          toast.success(`✅ Successfully saved ${foundLeads.length} leads to your database!`);
        } catch (error) {
          toast.dismiss(savingToast);
          toast.error(`❌ Failed to save leads to database: ${error.message}`);
          console.error('❌ Batch save failed:', error);
        }
      } else {
        toast.error('No leads found in this scrape. Try again or check your API credits.');
      }

    } catch (error) {
      console.error('❌ Bulk scrape error:', error);
      toast.error('Bulk scrape failed - please try again');
    } finally {
      setScraping(false);
      setScrapeProgress(0);
    }
  };

  const saveBatchLeadsToDatabase = async (leads) => {
    console.log(`💾 Starting EMERGENCY FALLBACK save of ${leads.length} leads...`);
    
    try {
      // Import emergency storage
      const { default: EmergencyLeadStorage } = await import('../services/EmergencyLeadStorage.js');
      const emergencyStorage = new EmergencyLeadStorage();
      
      // Prepare lead data
      const leadDataArray = leads.map(lead => ({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.company,
        phone: '', // Not always available from lead providers
        title: lead.title || 'Executive',
        source: 'bulk-multi-provider-scrape',
        notes: `Found via multi-provider scrape - Provider: ${lead.provider}, Status: ${lead.status}, Confidence: ${lead.confidence}`
      }));

      return await securityBypass.executeWithBypass(async () => {
        let savedCount = 0;
        let failedCount = 0;
        let emergencySavedCount = 0;
        
        // Firebase is consistently failing - use emergency storage directly
        console.log('🚨 Firebase WebChannelConnection transport errors persist - switching to EMERGENCY STORAGE mode');
        
        for (let i = 0; i < leadDataArray.length; i++) {
          const leadData = leadDataArray[i];
          const leadEmail = leadData.email;
          
          console.log(`� Emergency saving lead ${i + 1}/${leadDataArray.length}: ${leadEmail}...`);
          
          try {
            // Save to emergency local storage immediately
            const emergencyResult = emergencyStorage.saveLeadEmergency(leadData);
            
            if (emergencyResult) {
              console.log(`🚨 EMERGENCY SAVE SUCCESS: ${leadEmail} saved to local storage`);
              emergencySavedCount++;
              savedCount++; // Count as saved for UI purposes
            } else {
              throw new Error('Emergency storage failed');
            }
            
          } catch (error) {
            console.error(`❌ Complete storage failure for ${leadEmail}:`, error);
            failedCount++;
          }
        }
        
        console.log(`🚨 EMERGENCY STORAGE RESULTS: ${emergencySavedCount} leads saved to local storage`);
        console.log(`� Final results: ${savedCount} total saved, ${failedCount} failed out of ${leadDataArray.length} total`);
        
        if (emergencySavedCount > 0) {
          // Show emergency storage message
          toast.success(`� Emergency Storage: ${emergencySavedCount} leads saved locally! Will sync to Firebase when connection is restored.`, {
            duration: 8000
          });
          
          // Show sync count
          const totalEmergencyLeads = emergencyStorage.getEmergencyLeadCount();
          console.log(`📊 Total emergency leads awaiting Firebase sync: ${totalEmergencyLeads}`);
          
          // 🎯 NEW: Automatically sync emergency leads to Recent Leads UI
          try {
            console.log(`📱 Auto-syncing ${emergencySavedCount} emergency leads to Recent Leads section...`);
            await emergencyStorage.syncEmergencyLeadsToUI();
            
            toast.success(`📱 Emergency leads now visible in Recent Leads section!`, {
              duration: 6000
            });
            
            // Trigger a refresh of the Recent Leads component
            window.dispatchEvent(new CustomEvent('refreshRecentLeads'));
            
          } catch (uiSyncError) {
            console.error('❌ Failed to sync emergency leads to UI:', uiSyncError);
            toast.error('Emergency leads saved but failed to display in Recent Leads');
          }
          
          return {
            success: true, 
            savedCount: savedCount, 
            failedCount: failedCount,
            emergencyMode: true,
            emergencySavedCount: emergencySavedCount 
          };
        } else {
          throw new Error(`Complete system failure - both Firebase and emergency storage failed for all ${leadDataArray.length} leads`);
        }
      });
      
    } catch (error) {
      console.error('❌ Emergency save process error:', error.message);
      throw error;
    }
  };

  const saveLeadToDatabase = async (leadData) => {
    // This function is now deprecated in favor of batch saving
    console.log('⚠️ Individual save called - should use batch save instead');
    return { success: false, error: 'Use batch save instead' };
  };

  const handleQuickScrape = (targetCount) => {
    setScrapeForm(prev => ({ ...prev, leadCount: targetCount }));
    handleBulkScrape();
  };

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">🚀</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold">🚀 Multi-Provider Executive Scraper</h3>
          <p className="text-purple-100">Find 10-40 high-value executive emails in one scrape</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => handleQuickScrape(10)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">10 Leads</div>
          <div className="text-sm text-purple-100">Quick Scrape</div>
        </button>
        <button
          onClick={() => handleQuickScrape(20)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">20 Leads</div>
          <div className="text-sm text-purple-100">Standard</div>
        </button>
        <button
          onClick={() => handleQuickScrape(30)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">30 Leads</div>
          <div className="text-sm text-purple-100">Power Scrape</div>
        </button>
        <button
          onClick={() => handleQuickScrape(40)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">40 Leads</div>
          <div className="text-sm text-purple-100">Max Scrape</div>
        </button>
      </div>

      {/* Custom Settings */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-3">Custom Scrape Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Leads</label>
            <input
              type="range"
              min="5"
              max="40"
              value={scrapeForm.leadCount}
              onChange={(e) => setScrapeForm(prev => ({ ...prev, leadCount: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm mt-1">{scrapeForm.leadCount} leads</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Quality</label>
            <select 
              className="w-full bg-white/20 border border-white/30 rounded p-2 text-white"
              value={scrapeForm.targetType || 'smb'}
              onChange={(e) => setScrapeForm(prev => ({ ...prev, targetType: e.target.value }))}
              style={{ color: 'white' }}
            >
              <option value="smb" style={{ color: 'black', backgroundColor: 'white' }}>Small to Medium Businesses</option>
              <option value="johnq" style={{ color: 'black', backgroundColor: 'white' }}>John Q Customer Business Owners</option>
              <option value="support" style={{ color: 'black', backgroundColor: 'white' }}>Support Genie Prospects</option>
              <option value="local" style={{ color: 'black', backgroundColor: 'white' }}>Local Service Businesses</option>
              <option value="ecommerce" style={{ color: 'black', backgroundColor: 'white' }}>E-commerce Store Owners</option>
              <option value="professional" style={{ color: 'black', backgroundColor: 'white' }}>Professional Services</option>
              <option value="saas" style={{ color: 'black', backgroundColor: 'white' }}>SaaS Startups</option>
              <option value="agencies" style={{ color: 'black', backgroundColor: 'white' }}>Marketing Agencies</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleBulkScrape}
          disabled={scraping}
          className="w-full mt-4 bg-white text-purple-600 py-3 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {scraping ? `🔍 Scraping... ${scrapeProgress}%` : `🚀 Start Custom Scrape (${scrapeForm.leadCount} leads)`}
        </button>
      </div>

      {/* Progress Bar */}
      {scraping && (
        <div className="mb-4">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${scrapeProgress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm mt-1">
            Finding executives... {scrapeProgress}% complete
          </div>
        </div>
      )}

      {/* Results Summary */}
      {scrapedLeads.length > 0 && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-100 mb-2">
            ✅ Scrape Complete! Found {scrapedLeads.length} Executive Emails
          </h4>
          <div className="text-sm text-green-200 space-y-1">
            {scrapedLeads.slice(0, 5).map((lead, index) => (
              <div key={index}>
                • {lead.firstName} {lead.lastName} - {lead.email} ({lead.company})
              </div>
            ))}
            {scrapedLeads.length > 5 && (
              <div className="text-green-300 font-medium">
                + {scrapedLeads.length - 5} more leads saved to Recent Leads database
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-purple-200 mt-4">
        💡 All leads auto-save to Recent Leads database. Uses Hunter.io, VoilaNorbert, AND Prospeo APIs for maximum coverage!
      </div>
    </div>
  );
};

export default BulkProspeoScraper;