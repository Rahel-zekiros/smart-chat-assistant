
export const generateImage = async (req, res) => {
  try {
    const { prompt, image } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter an image description.",
      });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Pollinations API key is missing.",
      });
    }

    let response;

    if (image) {
      // Uploaded image must be a valid base64 data URL.
      const match = image.match(
        /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          error: "Invalid image format. Use PNG, JPEG, or WebP.",
        });
      }

      const mimeType = match[1];
      const imageBuffer = Buffer.from(match[2], "base64");

      if (
        imageBuffer.length === 0 ||
        imageBuffer.length > 10 * 1024 * 1024
      ) {
        return res.status(400).json({
          success: false,
          error: "Image must be smaller than 10 MB.",
        });
      }

      const extension =
        mimeType === "image/jpeg"
          ? "jpg"
          : mimeType === "image/webp"
            ? "webp"
            : "png";

      const formData = new FormData();

      formData.append(
        "image",
        new Blob([imageBuffer], { type: mimeType }),
        `upload.${extension}`
      );

      formData.append("prompt", prompt.trim());
      formData.append("model", "kontext");
      formData.append("size", "1024x1024");

      response = await fetch(
        "https://gen.pollinations.ai/v1/images/edits",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );
    } else {
      // Original text-to-image generation.
      const imageUrl =
        `https://gen.pollinations.ai/image/${encodeURIComponent(
          prompt.trim()
        )}?model=flux`;

      response = await fetch(imageUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pollinations error:",
        response.status,
        errorText
      );

      return res.status(
        response.status >= 400 && response.status < 600
          ? response.status
          : 502
      ).json({
        success: false,
        error:
          response.status === 401 || response.status === 403
            ? "API key is invalid or access is denied."
            : response.status === 402
              ? "Insufficient Pollen balance."
              : response.status === 429
                ? "Rate limit reached. Please try again later."
                : "Image generation or editing failed. Check the model and API response.",
      });
    }

    let imageData;
    let contentType;

    if (image) {
      // The edits endpoint returns JSON image data.
      const result = await response.json();
      const generated = result.data?.[0];

      if (generated?.b64_json) {
        contentType = generated.mime_type || "image/png";
        imageData = `data:${contentType};base64,${generated.b64_json}`;
      } else if (generated?.url) {
        // Handle URL responses too.
        const imageResponse = await fetch(generated.url);

        if (!imageResponse.ok) {
          throw new Error("Could not retrieve the edited image.");
        }

        const buffer = Buffer.from(
          await imageResponse.arrayBuffer()
        );

        contentType =
          imageResponse.headers.get("content-type") ||
          "image/png";

        if (!contentType.startsWith("image/")) {
          throw new Error("The API did not return an image.");
        }

        imageData =
          `data:${contentType};base64,${buffer.toString("base64")}`;
      } else {
        console.error("Unexpected edits response:", result);

        return res.status(502).json({
          success: false,
          error: "The editing API returned no image.",
        });
      }
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());

      contentType =
        response.headers.get("content-type") || "image/jpeg";

      if (!contentType.startsWith("image/")) {
        return res.status(502).json({
          success: false,
          error: "The API did not return an image.",
        });
      }

      imageData =
        `data:${contentType};base64,${buffer.toString("base64")}`;
    }

    return res.status(200).json({
      success: true,
      data: {
        image: imageData,
        prompt: prompt.trim(),
      },
    });
  } catch (error) {
    console.error("Image generation error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Something went wrong while generating or editing the image.",
    });
  }
};
