import { useEffect, useState } from "react";

export default function useBlogs() {

  const [blogs, setBlogs] = useState([]);

  useEffect(() => {

    const dummy = [
      {
        id: 1,
        title: "Understanding React Server Components",
        description: "A deep dive into RSC architecture",
        author: "Dan Abramov",
        readTime: 5,
        likes: 120
      }
    ];

    setBlogs(dummy);

  }, []);

  return { blogs };
}