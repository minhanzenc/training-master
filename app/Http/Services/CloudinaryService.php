<?php

namespace App\Http\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
// use Cloudinary\Cloudinary;


class CloudinaryService
{
    /**
     * Upload image to Cloudinary
     * 
     * @param UploadedFile $file
     * @param string $folder Folder in Cloudinary (e.g., 'products')
     * @return array{success: bool, url: string|null, public_id: string|null, message: string|null}
     */
    public function uploadImage(UploadedFile $file, string $folder = 'products'): array
    {
        try {
            $uploadedFile = Cloudinary::uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder' => $folder,
                    'resource_type' => 'image',
                    'transformation' => [
                        'quality' => 'auto',
                        'fetch_format' => 'auto'
                    ]
                ]
            )->getArrayCopy();

            return [
                'success' => true,
                'url' => $uploadedFile['secure_url'] ?? '',
                'public_id' => $uploadedFile['public_id'] ?? '',
                'message' => 'Upload ảnh thành công'
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary upload error: ' . $e->getMessage());
            return [
                'success' => false,
                'url' => null,
                'public_id' => null,
                'message' => 'Lỗi khi upload ảnh: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete image from Cloudinary
     * 
     * @param string $publicId Public ID of the image
     * @return array{success: bool, message: string}
     */
    public function deleteImage(string $publicId): array
    {
        try {
            Cloudinary::uploadApi()->destroy($publicId);

            return [
                'success' => true,
                'message' => 'Xóa ảnh thành công'
            ];
        } catch (\Exception $e) {
            Log::error('Cloudinary delete error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Lỗi khi xóa ảnh: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     * 
     * @param string $url Cloudinary URL
     * @return string|null
     */
    public function extractPublicId(string $url): ?string
    {
        // Extract public_id from URL like: https://res.cloudinary.com/.../products/abc123.jpg
        $pattern = '/\/v\d+\/(.+)\.\w+$/';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
