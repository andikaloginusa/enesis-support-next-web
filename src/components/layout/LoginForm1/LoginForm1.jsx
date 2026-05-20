"use client";
import { currentYear } from "@/utils/data";
import wieldyLogo from "@public/logo.png";
import loginPic from "@public/signIn/sign1.png";
import { Button, Card, Divider, Form, Input, theme, Typography } from "antd";
import Image from "next/image";
import Link from "next/link";
import { AiFillApple } from "react-icons/ai";
import { FaPaypal } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { RiMastercardFill } from "react-icons/ri";
import { useAuth } from "@/hooks";

const { useToken } = theme;

export const LoginForm1 = () => {
  const { token } = useToken();
  const { login, isLoading } = useAuth();

  const onFinish = (values) => {
    login(values);
  };

  return (
    <div className="grid grid-cols-12 gap-6 w-full min-h-screen p-4">
      <div className="col-span-12 lg:col-span-6 flex justify-center">
        <div className="flex flex-col justify-around w-[640px] max-w-full p-4 lg:p-8 min-h-full">
          <div className="mb-8">
            <Link href={"#"}>
              <Image src={wieldyLogo} alt="wieldy-logo" className="w-[90px]" />
            </Link>
          </div>
          <div className="mb-4">
            <div className="mb-10">
              <div
                className="text-4xl font-semibold mb-2.5"
                style={{
                  color: token.colorTextHeading,
                }}
              >
                Signin
              </div>
              <Typography.Text>Continue where you left off</Typography.Text>
            </div>
            <div className="flex max-sm:flex-col sm:items-center gap-3 mb-6">
              <Button
                className="flex-1"
                icon={<FcGoogle fontSize={24} />}
                size="large"
              >
                Login with Google
              </Button>
              <Button
                className="flex-1"
                icon={<AiFillApple fontSize={24} />}
                size="large"
              >
                Login with Apple
              </Button>
            </div>
            <Divider className="mb-6" plain>
              or
            </Divider>
            <Form layout="vertical" className="mb-10" onFinish={onFinish}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username or email!" },
                ]}
              >
                <Input placeholder="Username or Email" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                className="mb-2"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password placeholder="Password" size="large" />
              </Form.Item>
              <Link
                className="block underline mb-5"
                href={"/auth/forgot-password"}
              >
                Forgot password?
              </Link>
              <Form.Item>
                <Button 
                  block 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={isLoading}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
            <Typography.Text>
              Do not have an account yet?{" "}
              <Link href={"/auth/signup-1"}>Create New Account</Link>
            </Typography.Text>
          </div>
          <div>
            <Typography.Text>{`Copyright Company Name © ${currentYear}`}</Typography.Text>
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <Card
          style={{ backgroundColor: token.colorPrimary }}
          className="h-full"
          classNames={{
            body: "p-8 text-white max-w-[700px] mx-auto flex flex-col justify-between h-full",
          }}
          variant={"borderless"}
        >
          <div className="mb-5">
            <Typography.Title className="text-white text-3xl lg:text-4xl font-light">
              The simplest way to build your projects with ReactJS and AntD
            </Typography.Title>
            <Typography.Text className="text-white text-base lg:text-2xl font-light">
              We aim to save 50% of your time and cost
            </Typography.Text>
          </div>
          <div className="mb-5">
            <Image src={loginPic} alt="signIn-img" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xl">
              <RiMastercardFill fontSize={20} />
              <span>Mastercard</span>
            </div>
            <div className="flex items-center gap-2 text-xl">
              <FaPaypal fontSize={20} />
              <span>PayPal</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
