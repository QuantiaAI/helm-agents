import type { ReactElement } from "react";
import { render, type RenderResult } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../src/i18n";

/** Render `element` at `path`, matched by `routePath` (e.g. "/:locale/history"). */
export function renderAt(
  path: string,
  routePath: string,
  element: ReactElement,
): RenderResult {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}
