import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/homepage/card";
import Footer from "./ui/Footer";

const LearningResources = () => {
  const categories = [
    {
      title: "Web Development",
      description: "Resources that helped me learn HTML, CSS, JavaScript, and modern frameworks like React.",
      resources: [
        { name: "freeCodeCamp", link: "https://www.freecodecamp.org/", description: "An excellent platform for interactive learning of web development basics." },
        { name: "MDN Web Docs", link: "https://developer.mozilla.org/", description: "Official documentation for web technologies. Perfect for references and deeper understanding." },
        { name: "CSS-Tricks", link: "https://css-tricks.com/", description: "A fantastic blog with useful guides for CSS and frontend development." },
      ],
    },
    {
      title: "Programming Languages",
      description: "Tools and documentation I use when working with different programming languages.",
      resources: [
        { name: "Python Docs", link: "https://docs.python.org/", description: "Official Python documentation, which I use for scripting and automation." },
        { name: "C# Documentation", link: "https://learn.microsoft.com/dotnet/csharp/", description: "Guides and tutorials for C#, which I use in Unity projects." },
        { name: "Stack Overflow", link: "https://stackoverflow.com/", description: "My first stop for solving coding problems." },
      ],
    },
    {
      title: "Design & Prototyping",
      description: "Resources I use for UI/UX design and prototyping.",
      resources: [
        { name: "Figma", link: "https://www.figma.com/", description: "My favorite tool for UI/UX design. Great for team collaboration." },
        { name: "Dribbble", link: "https://dribbble.com/", description: "A source of inspiration for modern designs and animations." },
        { name: "Canva", link: "https://www.canva.com/", description: "A simple tool for creating graphics and presentations." },
      ],
    },
    {
      title: "Learning Platforms",
      description: "Websites and courses that helped me expand my knowledge.",
      resources: [
        { name: "Udemy", link: "https://www.udemy.com/", description: "A wide range of courses on topics from programming to design." },
        { name: "Pluralsight", link: "https://www.pluralsight.com/", description: "Great courses focused on advanced IT topics." },
        { name: "Coursera", link: "https://www.coursera.org/", description: "World-class academic courses and certifications." },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="container py-20">
          <h2 className="text-4xl font-extrabold mb-12 text-center text-sky-400 select-none">
            Learning Resources
          </h2>
          {categories.map((category, index) => (
            <div key={index} className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <h3 className="text-3xl font-bold mb-4 text-sky-400">{category.title}</h3>
                <p className="text-gray-300 mb-6">{category.description}</p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {category.resources.map((resource, i) => (
                  <motion.div
                    key={resource.name}
                    className="p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                  >
                    <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-sky-500 overflow-hidden shadow-lg">
                      <CardContent className="p-6 space-y-4">
                        <h4 className="text-2xl font-bold text-sky-400">{resource.name}</h4>
                        <p className="text-gray-300 text-sm">{resource.description}</p>
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-4 px-4 py-2 bg-sky-500 text-white font-semibold rounded hover:bg-sky-600 transition duration-300"
                        >
                          Visit
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LearningResources;