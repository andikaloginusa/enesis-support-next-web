"use client";

import React, { useState, useEffect } from "react";
import { SidebarToggleButton } from "@/components/layout/SidebarToggleButton";
import { Modal, Avatar } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks";

export function Header1() {
  const { logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_credent");
      if (raw) {
        const creds = JSON.parse(raw);
        setUserName(
          creds.nama || creds.name || creds.username || "User"
        );
      }
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    setModalOpen(false);
    logout();
  };

  return (
    <>
      <div className="relative flex flex-1 items-center">
        <div className="-ml-3 mr-6">
          <SidebarToggleButton />
        </div>
        <div className="ml-auto pl-4 flex items-center">
          {/* User name chip — click to open logout modal */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-slate-50 hover:border-slate-300 transition-all group cursor-pointer"
          >
            <Avatar
              size={26}
              icon={<UserOutlined />}
              className="bg-blue-100 text-blue-600 flex-shrink-0"
            />
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 max-w-[160px] truncate leading-tight">
              {userName}
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={340}
        centered
        closable={false}
        styles={{ body: { padding: 0 } }}
        className="rounded-2xl overflow-hidden"
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <LogoutOutlined className="text-red-500 text-2xl" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-base">Keluar dari Akun?</p>
            <p className="text-slate-500 text-sm mt-1">
              Anda akan keluar sebagai{" "}
              <strong className="text-slate-700">{userName}</strong>.
            </p>
          </div>
          <div className="flex w-full gap-2 mt-1">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

