import { createClient } from "@supabase/supabase-js";
import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import ImageKit from "imagekit";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

const IMAGEKIT_URL = process.env.IMAGEKIT_URL;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadImages(files) {
  const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL,
  });

  const imageUploadPromises = Object.keys(files).map(async (key, index) => {
    const file = files[key][0];
    const buffer = await fs.readFile(file.filepath);
    return imagekit.upload({
      file: buffer,
      fileName: `${index}`,
      folder: "/thegarden",
      useUniqueFileName: true,
    });
  });

  return Promise.all(imageUploadPromises);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const form = new IncomingForm();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const text = fields.text[0];
    const savedImages = files ? await uploadImages(files) : [];

    const { data, error } = await supabase.from("thegarden_notes").insert([
      {
        text,
        images: savedImages.map(({ url, thumbnailUrl }) => ({
          url,
          thumbnailUrl,
          description: "",
        })),
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    try {
      console.log("revalidating");
      await res.revalidate(`/`);
    } catch (error) {
      console.log(error);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
