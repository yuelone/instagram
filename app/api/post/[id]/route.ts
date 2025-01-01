import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Post {
  id: string;
  avatar: string;
  account: string;
  verify: boolean;
  subtitle: string;
  photos: string[];
  likes: number;
  description: string;
  hashTags: string[];
  createTime: string;
};

interface Data {
  post: Post[];
}

interface GetParams {
  id: string;
}

const dbPath: string = path.join(process.cwd(), "data", "post.json");

const readData = (): Data => {
  const fileContent = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(fileContent) as Data;
};

export const GET = async (_: Request, { params }: { params: GetParams }) => {
  const id = params.id;

  let findCurrentData = null;

  try {
    await new Promise<Data>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, 2000);

      try {
        const currentData = readData();
        findCurrentData = currentData.post.find((post) => post.id === id);
        if (!findCurrentData) {
          reject(new Error("Item not found"));
        } else {
          resolve(currentData);
        }
      } catch (error) {
        reject(error);
      } finally {
        clearTimeout(timeout);
      }
    });

    if (!findCurrentData) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(findCurrentData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
};
