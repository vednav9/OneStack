import { Dialog } from "@headlessui/react";

export default function MobileSidebar({ open, setOpen }) {
  return (
    <Dialog open={open} onClose={setOpen} className="lg:hidden">
      <Dialog.Panel className="fixed inset-y-0 left-0 bg-white w-64 p-4 shadow">
        <p className="font-bold mb-4">Menu</p>
      </Dialog.Panel>
    </Dialog>
  );
}
