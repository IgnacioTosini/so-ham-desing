// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { SmoothScrollToTop } from "@/app/(shop)/piezas/[id]/SmoothScrollToTop";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("resets scroll immediately on product changes, even with global smooth scrolling", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => frames.push(callback));
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const { rerender, unmount } = render(<SmoothScrollToTop routeKey="first" />);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
    frames[0](0);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    rerender(<SmoothScrollToTop routeKey="second" />);
    expect(cancel).toHaveBeenCalledWith(1);
    expect(scrollTo).toHaveBeenCalledTimes(3);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
    unmount();
    expect(cancel).toHaveBeenCalledWith(2);
});
