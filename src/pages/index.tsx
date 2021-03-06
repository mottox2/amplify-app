import type { NextPage } from "next";
import Head from "next/head";
import { API, graphqlOperation } from "aws-amplify";
import { listBlogs } from "../graphql/queries";
import { useEffect } from "react";
import { createBlog } from "../graphql/mutations";
import { useState } from "react";
import { onCreateBlog } from "../graphql/subscriptions";

const Home: NextPage = () => {
  const [items, setItems] = useState<
    {
      name: string;
    }[]
  >([]);
  useEffect(() => {
    const fetch = async () => {
      const res = await API.graphql({
        query: listBlogs,
      });
      setItems((res as any).data.listBlogs.items);

      (API.graphql(graphqlOperation(onCreateBlog)) as any).subscribe({
        next: ({ provider, value }: any) => {
          console.log({ provider, value });
          const data = value.data.onCreateBlog;
          setItems((items) => [...items, data]);
        },
      });
    };
    fetch();
  }, []);

  const [name, setName] = useState("");
  const onSubmit = () => {
    API.graphql({
      query: createBlog,
      variables: {
        input: {
          name,
        },
      },
    });
    setName("");
  };

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Save</button>
      </form>

      <ul>
        {items.map((item, key) => {
          return <li key={key}>{item.name}</li>;
        })}
      </ul>
    </div>
  );
};

export default Home;
