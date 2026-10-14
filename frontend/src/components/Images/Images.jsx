import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ImagePlus, Download, LoaderCircle, Upload, X } from "lucide-react";
import styles from "./Image.module.css";
import API_BASE_URL from '../../service/core/api.js'


export default function Images() {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [generatedImage, error, isLoading]);
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be 10 MB or less.");
      e.target.value = "";
      return;
    }

    setError("");
    setGeneratedImage("");
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setError("");
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("Could not read the selected image."));

      reader.readAsDataURL(file);
    });

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setGeneratedImage("");

    try {
      const payload = {
        prompt: prompt.trim(),
      };

      // If an image is uploaded, send it for image editing.
      if (selectedImage) {
        payload.image = await fileToDataUrl(selectedImage);
      }

      const response = await axios.post(
        `${API_BASE_URL}/images/generate`,
        payload,
      );

      if (response.data.success) {
        setGeneratedImage(response.data.data.image);
      } else {
        setError("Image generation failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Could not generate image. Check your backend and API settings.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "generated-image.png";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <section className={styles.container}>
      <header className={styles.heading}>
        <ImagePlus size={28} />
        <div>
          <h2>Create images</h2>
          <p>Describe an image or upload one to edit it with AI.</p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleGenerate}>
        <label className={styles.uploadLabel}>
          <Upload size={18} />
          Upload an image
          <input
            className={styles.fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            disabled={isLoading}
          />
        </label>

        {previewUrl && (
          <div className={styles.uploadPreview}>
            <img src={previewUrl} alt="Uploaded preview" />

            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemoveImage}
              disabled={isLoading}
              aria-label="Remove uploaded image"
            >
              <X size={18} />
            </button>

            <p>{selectedImage?.name}</p>
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            selectedImage
              ? "Describe how you want to edit this image..."
              : "A beautiful Ethiopian landscape at sunset..."
          }
          rows={4}
          maxLength={2000}
          disabled={isLoading}
        />

        <button type="submit" disabled={!prompt.trim() || isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className={styles.spinner} size={18} />
              {selectedImage ? "Editing..." : "Generating..."}
            </>
          ) : (
            <>
              <ImagePlus size={18} />
              {selectedImage ? "Edit image with AI" : "Generate image"}
            </>
          )}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {isLoading && (
        <div className={styles.loading}>
          <LoaderCircle className={styles.spinner} size={30} />
          <p>
            {selectedImage
              ? "AI is editing your image..."
              : "Your image is being generated..."}
          </p>
        </div>
      )}

      {generatedImage && (
        <div className={styles.result}>
          <div className={styles.imageFrame}>
            <img src={generatedImage} alt={prompt || "Generated image"} />
          </div>

          <button
            className={styles.downloadButton}
            type="button"
            onClick={handleDownload}
          >
            <Download size={18} />
            Download image
          </button>
        </div>
      )}
      <div ref={bottomRef} />
    </section>
  );
}
