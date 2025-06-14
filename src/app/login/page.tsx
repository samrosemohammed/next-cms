"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Page = () => {
  const navigate = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.ok) {
      toast.error("Invalid credentials");
      setLoading(false);
    }
    if (result?.ok) {
      navigate.push("/dashboard");
      setLoading(false);
    }
  };
  return (
    <MaxWidthWrapper className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-lg w-full ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Classroom Login</CardTitle>
          <CardDescription>
            Please enter your username and password to login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Email">Username</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="text"
              placeholder="company@gmail.com"
              required
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="Password">Password</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              type={showPassword ? "text" : "password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full hover:bg-green-500 transition-colors"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : null}{" "}
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </MaxWidthWrapper>
  );
};

export default Page;
