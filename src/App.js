import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
  { name: "funny", color: "#8b5" },
];

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
/**************** APP COMPONENT **********************/
function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was a problem getting data");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  function handleShowForm() {
    setShowForm(show => (show = !show));
  }

  return (
    <>
      <Header onHandleClick={handleShowForm} show={showForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

/**************** OTHER COMPONENTS **********************/
function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ onHandleClick, show }) {
  const appTitle = "FactSphere";
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="FactSphere Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button onClick={onHandleClick} className="btn btn-large btn-open">
        {!show ? "Share a fact" : "Close"}
      </button>
    </header>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            onClick={() => setCurrentCategory("all")}
            className="btn btn-all-categories"
          >
            All
          </button>
        </li>
        {CATEGORIES.map(cat => (
          <FactItem
            setCurrentCategory={setCurrentCategory}
            cat={cat}
            key={cat.name}
          />
        ))}
      </ul>
    </aside>
  );
}

function FactItem({ cat, setCurrentCategory }) {
  return (
    <li className="category">
      <button
        onClick={() => setCurrentCategory(cat.name)}
        className="btn btn-category"
        style={{ backgroundColor: cat.color }}
      >
        {cat.name}
      </button>
    </li>
  );
}

function NewFactForm({ setShowForm, setFacts }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // Prevent the browser reload
    e.preventDefault();

    // Check if data is valid. If so, create a new fact object
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      console.log("Data is valid");

      /* // Create a new fact object
      const newFact = {
        id: Math.round(Math.random() * 1000000),
        text,
        source,
        category,
        votesInteresting: 0,
        votesMindblowing: 0,
        votesFalse: 0,
        createdIn: new Date().getFullYear(),
      }; */

      // Upload fact to Supebase and receive the new fact objwct with the .select()
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert({ text, source, category })
        .select();

      setIsUploading(false);
      // Add the new fact to the UI: add the dact to state
      if (!error) setFacts(facts => [...facts, newFact[0]]);

      // Reset input fields
      setText("");
      setSource("");
      setCategory("");

      // Close the form
      setShowForm(false);
    } else {
      setError(true);
    }
  }

  return (
    <>
      {error && (
        <p className="error">
          ☠ Some of the data in the input fields are not valid. Try again!
        </p>
      )}
      <form className="fact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Share a fact with the world..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isUploading}
        />
        <span>{200 - textLength}</span>
        <input
          type="text"
          placeholder="Trustworthy source..."
          value={source}
          onChange={e => setSource(e.target.value)}
          disabled={isUploading}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={isUploading}
        >
          <option value="">Choose category:</option>
          {CATEGORIES.map(cat => (
            <option key={cat.name} value={cat.name}>
              {cat.name.toUpperCase()}
            </option>
          ))}
        </select>
        <button disabled={isUploading} className="btn btn-large">
          Post
        </button>
      </form>
    </>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet. Create the first one!
      </p>
    );
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map(fact => (
          <Fact fact={fact} setFacts={setFacts} key={fact.id} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(voteType) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [voteType]: fact[voteType] + 1 })
      .eq("id", fact.id)
      .select();

    setIsUpdating(false);

    if (!error)
      setFacts(facts =>
        facts.map(f => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔ DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find(cat => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
