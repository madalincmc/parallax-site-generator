import { sections } from "@/site/sections";
import { Menu, Preloader } from "@/stage/chrome";
import { Stage } from "@/stage/Stage";

export default function Home() {
  return (
    <>
      <Stage />
      <Preloader />
      <Menu sections={sections} />
      <main>
        {sections.map(({ slug, Component }) => (
          <Component key={slug} />
        ))}
      </main>
    </>
  );
}
