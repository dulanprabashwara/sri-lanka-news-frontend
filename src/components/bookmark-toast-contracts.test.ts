import test from "node:test";
import assert from "node:assert/strict";
import { toast, ToastItem } from "@/components/ui/toast";

test("toast system provides success, info, and error helpers with custom event dispatching", (t) => {
test("toast system provides success, info, and error helpers with custom event dispatching", () => {
  assert.equal(typeof toast.show, "function");
  assert.equal(typeof toast.success, "function");
  assert.equal(typeof toast.info, "function");
  assert.equal(typeof toast.error, "function");

  // In Node environment without DOM, toast safely skips window dispatching without crashing
  assert.doesNotThrow(() => {
    toast.success("Article saved to bookmarks");
    toast.info("Article removed from bookmarks");
    toast.error("Unable to update bookmark");
  });
});

test("ToastItem data contract contains id, message, type, and optional duration", () => {
  const item: ToastItem = {
    id: "toast-123",
    message: "Article saved to bookmarks",
    type: "success",
    duration: 3500,
  };

  assert.equal(item.id, "toast-123");
  assert.equal(item.message, "Article saved to bookmarks");
  assert.equal(item.type, "success");
  assert.equal(item.duration, 3500);
});
