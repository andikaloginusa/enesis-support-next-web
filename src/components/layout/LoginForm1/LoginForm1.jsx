"use client";

import React from "react";
import { Button, Form, Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks";

export const LoginForm1 = () => {
  const { login, isLoading } = useAuth();

  const onFinish = (values) => {
    login(values);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4">
      {/* Decorative green wave at bottom */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none select-none">
        <svg viewBox="0 0 1440 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,160 C360,220 720,80 1080,160 C1260,200 1360,180 1440,160 L1440,220 L0,220 Z"
            fill="#16a34a"
            opacity="0.15"
          />
          <path
            d="M0,180 C400,120 800,200 1200,160 C1320,145 1390,170 1440,180 L1440,220 L0,220 Z"
            fill="#15803d"
            opacity="0.25"
          />
          <path
            d="M0,200 C300,170 700,220 1100,195 C1280,185 1400,200 1440,200 L1440,220 L0,220 Z"
            fill="#166534"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* EIS Support logo/title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-green-600 leading-none">
            EIS
          </h1>
          <span className="text-sm font-semibold text-slate-500 tracking-widest uppercase">
            Support
          </span>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 px-8 py-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Masuk</h2>
          <p className="text-slate-400 text-sm mb-6">
            Masukkan NIK dan password Anda untuk melanjutkan
          </p>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "NIK wajib diisi" }]}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 mr-1" />}
                placeholder="NIK"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password wajib diisi" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-1" />}
                placeholder="Password"
                size="large"
                className="rounded-xl"
              />
            </Form.Item>

            {/* commented: forgot password
            <Link className="block text-right text-xs text-green-600 hover:text-green-700 mb-4 -mt-2" href="/auth/forgot-password">
              Lupa password?
            </Link>
            */}

            <Form.Item className="mb-0 mt-2">
              <Button
                block
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                className="rounded-xl font-bold text-base h-11 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 shadow-sm shadow-green-200"
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} PT Enesis Group. All rights reserved.
        </p>
      </div>
    </div>
  );
};
