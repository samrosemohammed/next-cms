import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbConnect } from "./db";
import UserModel from "@/model/user";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "company@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await dbConnect();

        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const randomName = Math.random().toString(36).substring(7);
        let user = await UserModel.findOne({ email });
        // if (!user) {
        //   user = new UserModel({
        //     name: randomName,
        //     email,
        //     password,
        //     role: "user",
        //   });
        //   await user.save();
        // }
        if (user) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            image: user.image,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role; // Attach the role to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role; // Attach the role to the session
      }
      return session;
    },
  },
};
