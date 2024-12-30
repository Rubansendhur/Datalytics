import { Component } from '@angular/core';
import axios from 'axios';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {

  selectedImage: File | null = null;
  message: string = '';

  onFileSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }

  async onUpload(): Promise<void> {
    if (!this.selectedImage) {
      this.message = 'Please select an image first';
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedImage);

    try {
      const response = await axios.post('http://localhost:5000/upload2', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.message = 'Image uploaded successfully';
    } catch (error) {
      console.error('Error uploading image:', error);
      this.message = 'Error uploading image';
    }
  }
}
