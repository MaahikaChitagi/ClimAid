import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { IoIosArrowForward, IoMdArrowRoundForward } from "react-icons/io";
import { FaMapMarkedAlt, FaHandsHelping, FaBullhorn, FaSeedling } from "react-icons/fa";
import {
  MapPinIcon,
  HandRaisedIcon,
  MegaphoneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import './styles.css';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const Explore = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const articles = [
  {
    link: "https://apnews.com/article/wildfires-utah-arizona-grand-canyon-fire-clouds-4f859970e20ef298aa255c07acf34932", 
    source: "AP News",
    headline: "Wildfires in Arizona & Utah spawn dangerous fire clouds",
    byline: "Associated Press",
    img: "/wildfire.png"
  },
  {
    link: "https://www.bbc.com/news/articles/cg7j8x3xnrko", 
    source: "BBC News",
    headline: "Flooding in Beijing and Hebei kills over 30, evacuates 80,000+",
    byline: "BBC News Staff",
    img: "/floodnews1.png"
  },
  {
    link: "https://www.cbc.ca/news/canada/british-columbia/how-extreme-weather-affects-food-prices-1.7292120", 
    source: "CBC News",
    headline: "Historic drought in Canada threatens global food supply",
    byline: "CBC News",
    img: "/drought.png"
  },
  {
    link: "https://www.nbcdfw.com/news/local/texas-news/live-updates-texas-search-rescue-flood-tuesday/3880316/", 
    source: "The Associated Press",
    headline: "Severe flash flooding in Dallas – hundreds displaced",
    byline: "NBCDFW Staff",
    img: "/heatwave.png"
  }
];

const climateActionCards = [
  {
    title: "Community Clean-Up",
    
    description:
      "Join or organize local clean-up events to reduce waste and pollution in your neighborhood.",
    tags: ["Local Impact", "Weekend Effort"],
  },
  {
    title: "Donate to Eco Charities",
  
    description:
      "Support environmental non-profits working on reforestation, wildlife protection, and clean energy.",
    tags: ["Tax-Deductible", "Trusted Orgs"],
  },
  {
    title: "Sustainable Shopping",
    
    description:
      "Switch to eco-friendly products that reduce your carbon footprint and support green businesses.",
    tags: ["Low Waste", "Everyday Habit"],
  },
];
const actions = [
  {
    title: "Report a Climate Issue",
    description:
      "Pinpoint areas impacted by flooding, drought, or infrastructure damage. Community reports help responders act quickly and effectively.",
    icon: MapPinIcon,
  },
  {
    title: "Offer Direct Help",
    description:
      "Provide essential supplies, shelter, transportation, or labor to support those recovering from climate-related disasters.",
    icon: HandRaisedIcon,
  },
  {
    title: "Raise Awareness",
    description:
      "Share accurate climate updates and organize community events. Informing others leads to collective change.",
    icon: MegaphoneIcon,
  },
  {
    title: "Join the Movement",
    description:
      "Become part of a local or global sustainability initiative. Advocate, volunteer, or support long-term resilience efforts.",
    icon: GlobeAltIcon,
  },
];


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ececec]">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex-1 overflow-y-auto bg-[#ececec] p-8 transition-all duration-300">
        {user && (
          <>
            <div className="relative w-full h-120 rounded-4xl overflow-hidden shadow-md mb-10">
              <img
                src="/exploreheader.png"
                alt="Scenic header"
                className="w-full h-full object-cover opacity-82 !object-[center_60%]"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#bcc474]/20 to-[#bcc474]/20 z-10 px-12 py-12 flex flex-col justify-between text-stone-800">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h1 className="mt-30 text-5xl font-bold text-white py-3 mr-10 drop-shadow-md">Explore Climate Impact</h1>

                  </div>
                </div>
              </div>
            </div>

            <div className="relative -mt-[150px] z-10 grid grid-cols-7 gap-4 px-7">
  {/* Wildfire Chart */}
  <div className="glass-card p-6 h-[310px] col-span-3">
    <h3 className="text-sm font-semibold text-[#D8E8EB] mb-2">Wildfire Acres Burned (U.S.)</h3>
    <ResponsiveContainer width="100%" height={245}>
      <BarChart
        data={[
          { year: '2020', acres: 8750000 },
          { year: '2021', acres: 7100000 },
          { year: '2022', acres: 7800000 },
          { year: '2023', acres: 8200000 },
        ]}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" tick={{ fill: "#5f5f5f", fontSize: 12 }} />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [`${value.toLocaleString()} acres`, 'Burned']}
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '12px',
            color: '#385157',
            padding: '10px 14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          }}
          itemStyle={{
            color: '#385157',
            fontSize: '14px',
            fontWeight: 800,
          }}
          labelFormatter={() => ''}
        />
        <Bar dataKey="acres" barSize={55} radius={[15, 15, 0, 0]}>
          {['#FCEEB5', '#FFD6A5', '#FFADAD', '#B5EAD7'].map((color, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Flood Events Chart */}
  <div className="glass-card p-6 h-[310px] col-span-2">
    <h3 className="text-sm font-semibold text-[#D8E8EB] mb-2">Major Flood Events (U.S.)</h3>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={[
          { year: '2020', floods: 75 },
          { year: '2021', floods: 82 },
          { year: '2022', floods: 91 },
          { year: '2023', floods: 106 },
        ]}
        margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
      >
        <XAxis dataKey="year" tick={{ fill: "#5f5f5f" }} />
        <YAxis hide />
        <Tooltip
          formatter={(value) => [`${value} events`, 'Floods']}
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '12px',
            color: '#385157',
            padding: '10px 14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          }}
          itemStyle={{
            color: '#385157',
            fontSize: '14px',
            fontWeight: 800,
          }}
          labelFormatter={() => ''}
        />
        <Line
          type="monotone"
          dataKey="floods"
          stroke="#A3C9A8"
          strokeWidth={3}
          dot={{ r: 8, fill: "#D4EAC8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Infrastructure Pie Chart */}
  <div className="glass-card p-6 h-[310px] col-span-2 relative">
    <h3 className="text-sm font-semibold text-[#D8E8EB] mb-2">Infrastructure Risk Breakdown</h3>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip
          formatter={(value, name) => [`${value}%`, name]}
          contentStyle={{
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '12px',
            color: '#385157',
            padding: '10px 14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          }}
          itemStyle={{
            color: '#385157',
            fontSize: '14px',
            fontWeight: 800,
          }}
          labelFormatter={() => ''}
        />
        <Pie
          data={[
            { name: 'Road Damage', value: 40 },
            { name: 'Water Systems', value: 25 },
            { name: 'Power Grid', value: 20 },
            { name: 'Communication', value: 15 },
          ]}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          labelLine={false}
        >
          {['#BFD8D2', '#F7DAD9', '#F5E1FD', '#E5FDD1'].map((fill, i) => (
            <Cell key={i} fill={fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>

    <div className="absolute top-[100px] left-[50%] -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-[#385157] text-xs font-semibold rounded-full px-2 py-[2px] shadow-md">
      40%
    </div>
  </div>
</div>

                          
<div className="relative w-full flex flex-col items-center text-center mt-15 px-6">
  {/* Gradient Badge */}


  {/* Headline */}
  <h2 className="text-4xl sm:text-5xl font-bold text-gray-500 leading-tight mt-5 mb-4">
    Explore the Impact<span className="text-4xl sm:text-5xl text-[#5B7A8A]! font-bold ">.  Make a Change.</span>
  </h2>

  {/* Description */}
  <p className="text-base sm:text-lg  text-gray-500 max-w-3xl leading-relaxed">  
    Use this page to understand what’s happening, then head to the dashboard to take action.  
    Whether it’s offering help, reporting an issue, or simply staying informed, this is your space to make a difference.
  </p>
</div>
<div className="w-full flex justify-center mb-4">
  <Link to="/reportissues">
    <button
      className="bg-gradient-to-r from-[#5B7A8A]/30 to-[#5B7A8A]/30 text-[#385157] mt-10 py-3 px-6 rounded-full font-medium text-sm transition-all duration-300 ease-in-out w-[12rem] hover:w-[14rem] hover:bg-gray-400 hover:text-white"
    >
      Issue a Report
    </button>
  </Link>
</div>
{/* News Section */}
<h3 className="text-2xl font-bold mt-16 mb-10 text-[#5B7A8A]">Recent News</h3>

<div className="relative h-[460px] w-full overflow-hidden">
  <div className="absolute flex animate-scroll-loop gap-6">
    {[...Array(2)].flatMap((_, i) =>
      articles.map((article, index) => (
        <div
          key={`card-${i}-${index}`}
          className="rounded-3xl overflow-hidden shadow-lg w-[290px] bg-white text-gray-900 h-[420px] transition duration-300 hover:shadow-2xl"
        >
          {/* Image */}
          <img
            src={article.img}
            alt="Article"
            className="w-full h-[220px] object-cover"
          />

          {/* Text Body */}
          <div className="bg-white px-4 pt-3 pb-4 h-[200px] flex flex-col justify-between">
            <div>
              <span className="text-yellow-500 text-s font-semibold mb-1 block">
                News+
              </span>
              <p className="text-[12px] uppercase text-gray-500 font-semibold mb-2 tracking-tight leading-3">
                <span className="font-bold">{article.source}</span> MAGAZINE
              </p>
              <h4 className="text-[16px] pt-5 font-semibold leading-snug text-gray-900 hover:underline">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.headline}
                </a>
              </h4>
            </div>
            <div className="flex items-center justify-between text-gray-500 text-sm mt-3">
              <span className="text-sm font-medium">{article.byline}</span>
              <span className="text-xl font-bold">•••</span>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

{/* article section */}
<div className="flex flex-col lg:flex-row gap-6 mt-10">
  {/* Left: Large Feature Card */}
  <div className="relative w-full lg:w-2/3 h-[320px] rounded-3xl overflow-hidden ">
    <img
      src="/heatwave2.jpg"
      alt="Heatwave landscape"
      className="w-full h-full object-cover "
    />
    
              <div className="absolute inset-0 bg-lime-400/10 mix-blend-multiply pointer-events-none" />

    <div className="absolute inset-0 bg-gradient-to-t from-[#385157] via-transparent to-transparent"></div>
    <div className="absolute bottom-5 left-5 text-white">
      <p className="bg-white/20 backdrop-blur-sm text-xs px-2 py-1 rounded-md mb-2 inline-block">
        July 29, 2025
      </p>
      <a
        href="https://subscriber.politicopro.com/article/eenews/2025/08/07/this-july-was-earths-third-warmest-on-record-eu-scientists-say-00497213"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2 className="text-xl md:text-2xl font-semibold leading-tight w-[90%] hover:underline">
          Heatwaves intensify across Europe, pushing cities to the brink
        </h2>
      </a>
    </div>
    <a
      href="https://subscriber.politicopro.com/article/eenews/2025/08/07/this-july-was-earths-third-warmest-on-record-eu-scientists-say-00497213"
      target="_blank"
      rel="noopener noreferrer"
    >
<button className="absolute top-4 right-4 w-12 h-12 rounded-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-md flex items-center justify-center hover:bg-white/20 transition">
  <svg
    className="w-6 h-6 text-yellow-500 transform -rotate-45"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
</button>

    </a>
  </div>

  {/* Right: Author Profile and Popular Articles */}
  <div className="w-full lg:w-1/3 flex flex-col justify-between">
    {/* Author */}
    <div className="pb-7 pt-6.5 bg-white/40 rounded-3xl p-5 shadow-md">
  {/* Author Info Row */}
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-md font-bold text-gray-900">Elizabeth Kolbert</h3>
      <p className="text-xs text-gray-500">Climate Journalist, Pulitzer Winner</p>
    </div>
    <div className="flex gap-3 text-gray-500 text-sm">
      <a href="https://twitter.com/elizkolbert" target="_blank" rel="noopener noreferrer" className="hover:text-black">🐦</a>
      <a href="https://www.newyorker.com/contributors/elizabeth-kolbert" target="_blank" rel="noopener noreferrer" className="hover:text-black">📘</a>
      <a href="https://en.wikipedia.org/wiki/Elizabeth_Kolbert" target="_blank" rel="noopener noreferrer" className="hover:text-black">🌐</a>
    </div>
  </div>

  {/* Article Preview */}
  <div className="text-sm text-gray-700 space-y-3">
    <p className="text-xs text-gray-500">August 3, 2025</p>
        <p>
      Elizabeth Kolbert is a staff writer at <span className="italic">The New Yorker</span> known for her in-depth reporting on the climate crisis.
    </p>
    <p>
      Kolbert explores how melting Arctic ice is reshaping coastlines and threatening ecosystems worldwide.
    </p>
    <a 
      href="https://www.newyorker.com/contributors/elizabeth-kolbert" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-lime-500 hover:underline text-sm font-medium"
    >
      Read article →
    </a>
  </div>
</div>

  </div>
</div>

<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
  {/* Left 3 cards in a row */}
  <div className="md:col-span-2 flex gap-6 items-start">
    {[
      {
        tag: "Drought",
        title: "Historic drought disrupts crops and global food prices",
        link: "https://www.cbc.ca/news/canada/british-columbia/how-extreme-weather-affects-food-prices-1.7292120",
        img: "/image2.png"
      },
      {
        tag: "Infrastructure",
        title: "Climate Change Impacts on the Built Environment",
        link: "https://www.epa.gov/climateimpacts/climate-change-impacts-built-environment",
        img: "/image1.png"
      },
      {
        tag: "Flooding",
        title: "Beijing floods displace 80,000+ and kill dozens",
        link: "https://www.bbc.com/news/articles/cg7j8x3xnrko",
        img: "/image3.png"
      }
    ].map((article, i) => (
      <a
        key={i}
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative rounded-2xl overflow-hidden shadow-md w-[230px] h-[320px] flex-shrink-0"
      >
        <img
          src={article.img}
          alt={article.tag}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-lime-400/10 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#385157] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#BFE063]/70 to-transparent text-white">
          <span className="text-xs font-semibold">{article.tag}</span>
          <h4 className="text-sm font-semibold leading-tight mt-1">
            {article.title}
          </h4>
        </div>
      </a>
    ))}
  </div>

  {/* Bot and Button with dynamic margin based on sidebarCollapsed */}
  <div
    className={`flex flex-col items-center md:items-start justify-between w-full 
      ${sidebarCollapsed ? 'ml-7 -mt-20' : 'ml-7 -mt-15'}`}
  >
    {/* EcoBot */}
    <img
      src="/ecobot.png"
      alt="EcoBot"
      className="w-[380px] object-contain drop-shadow-2xl brightness-110 contrast-125 saturate-150"
    />

    {/* Button */}
<button
  onClick={() => {
    const chatbot = document.getElementById("chatbot");
    if (chatbot) chatbot.scrollIntoView({ behavior: "smooth" });
  }}
  className={`bg-gradient-to-r from-[#bfc8ce] to-[#bfc8ce] text-[#385157] 
    ${sidebarCollapsed ? 'ml-23 -mt-10' : 'ml-18 -mt-15'} 
    py-2 px-4 rounded-full font-medium text-base transition-all duration-300 ease-in-out 
    w-[10rem] hover:w-[11rem] hover:bg-gray-400 hover:text-white flex items-center justify-center gap-3`}
>
  ClimaBot
  <svg
    className="w-7 h-7 text-white-500 transform rotate-[135deg]"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  </svg>
</button>

  </div>
</div>

<div id="chatbot">
<div className="text-center py-16 px-4">
  <h2 className="text-4xl sm:text-5xl font-bold text-gray-500 leading-tight mb-4">
    Chat with ClimaBot
    <span className="text-4xl sm:text-5xl text-[#5B7A8A]! font-bold">. Instant Answers. Real Impact.</span>
  </h2>

  <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
    Ask about climate events.  
    Get guidance. Make a difference.
  </p>
</div>



          <iframe
            src="https://maahikachitagi-climate-chatbot.hf.space"
            title="EcoEcho Chatbot"
            width="100%"
            height="1000"
            frameBorder="0"
            allow="microphone"
            className="rounded-xl border border-gray-300 shadow-lg"
          />
        </div>
          {/* === Popular Destination Section === */}
          <div className="mt-20 px-6">
            <h2 className="text-2xl text-[#5B7A8A] font-bold mb-1">Call To Action</h2>
        
            {/* Top Destination Cards */}
<div
  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${
    sidebarCollapsed ? 'px-2' : 'px-0'
  } py-12 transition-all duration-300`}
>
  {[
    {
      title: "Support Wildfire Recovery",
      
      description:
        "Help with wildfire aftermath by donating essentials, replanting trees, or joining cleanup efforts.",
      tags: ["Wildfire", "Reforestation"],
      image: "/wildfire2.png",
      link: "https://www.salvationarmyusa.org/disaster-relief/wildfire-relief/",
    },
    {
      title: "Aid Drought Relief",
     
      description:
        "Support communities facing drought by donating water supplies, supporting conservation, or raising awareness.",
      tags: ["Water Access", "Drought Relief"],
      image: "/drought2.png",
      link: "https://www.unicef.org/water-sanitation-and-hygiene-washhttps://www.globalgiving.org/projects/cdrs-texas-flood-relief-mission/donate/",
    },
    {
      title: "Flood Assistance Efforts",
      
      description:
        "Help flood-impacted areas by giving to disaster relief, assembling supply kits, or spreading safety info.",
      tags: ["Flood Recovery", "Emergency Kits"],
      image: "/flood2.png",
      link: "https://www.globalgiving.org/projects/cdrs-texas-flood-relief-mission/donate/",
    },
  ].map((card, index) => (
    <div
      key={index}
      
      className="w-[300px] opacity-95 h-[450px] rounded-[2rem] overflow-hidden relative shadow-xl "
      style={{
        backgroundImage: `url(${card.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      <div className="absolute inset-0 bg-gradient-to-t from-[#182326] to-transparent px-6 py-6 flex flex-col justify-end">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-white text-lg font-semibold">{card.title}</h2>

        </div>
        <p className="text-white/70  text-sm mb-3">{card.description}</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {card.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-[#D3F78B]/30 text-white font-medium text-xs px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <a href={card.link}>
          <button className="bg-[#bfc8ce] text-black text-sm font-semibold rounded-full py-2 w-full">
            Learn More
          </button>
        </a>
      </div>
    </div>
  ))}
</div>



<div className="text-center mb-10">
  <h2 className="text-3xl font-bold text-[#5B7A8A]">Your Impact Starts Here</h2>
  <p className="text-gray-600 mt-2 max-w-2xl mx-auto leading-relaxed">
    Climate change affects us all, but together, we can make a difference.
    Whether it’s volunteering, donating, or spreading awareness, every action
    matters. Let this be your first step toward a more sustainable world.
  </p>
</div>

<div className="flex justify-center gap-6 items-end mt-16 flex-wrap">
{[
  {
    title: "Report a Climate Issue",
    description:
      "Pinpoint areas impacted by flooding, drought, or infrastructure damage. Community reports help responders act quickly and effectively.",
    icon: MapPinIcon,
    link: "/reportissues",
    buttonText: "Issue a Report"
  },
  {
    title: "Offer Direct Help",
    description:
      "Provide essential supplies, shelter, transportation, or labor to support those recovering from climate-related disasters.",
    icon: HandRaisedIcon,
    link: "/dashboard", // link to Offer Help section
    buttonText: "Offer Help Now"
  },
  {
    title: "Raise Awareness",
    description:
      "Share accurate climate updates and organize community events. Informing others leads to collective change.",
    icon: MegaphoneIcon
  }
].map((card, i) => (
  <div
    key={i}
    className="relative w-64 h-60 group transition-transform duration-300"
  >
    <div className="absolute bottom-0 left-0 w-full bg-[#D7DCDD] rounded-3xl shadow-md p-6 text-center h-40 group-hover:h-70 hover:-translate-y-2 transition-all duration-300 ease-in-out overflow-hidden flex flex-col items-center">
      <card.icon className="h-8 w-8 -mb-20 text-[#5B7A8A]" />
      <h3 className="text-lg font-semibold text-[#5B7A8A] mt-24">{card.title}</h3>

      <p className="text-gray-600 text-sm opacity-0 pt-6 group-hover:opacity-100 transition-opacity duration-300">
        {card.description}
      </p>

      {card.buttonText && (
        <div className="w-full flex justify-center mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link to={card.link}>
            <button
              className="bg-gradient-to-r from-[#5B7A8A]/30 to-[#5B7A8A]/30 text-[#385157] mt-3 py-2 px-3 rounded-full font-medium text-sm transition-all duration-300 ease-in-out w-[12rem] hover:w-[14rem] hover:bg-gray-400 hover:text-white"
            >
              {card.buttonText}
            </button>
          </Link>
        </div>
      )}
    </div>
  </div>
))}

</div>

        
          </div>

          </>
        )}
        
      </div>
    </div>
  );
};

export default Explore;
