// lib/dojah.js
import axios from 'axios';

const DOJAH_BASE_URL = 'https://api.dojah.io/api/v1';

class DojahService {
  constructor() {
    this.appId = process.env.DOJAH_APP_ID;
    this.secretKey = process.env.DOJAH_SECRET_KEY;
    this.publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY;
  }

  async verifyBVN(bvn, options = {}) {
    try {
      const response = await axios.post(
        `${DOJAH_BASE_URL}/kyc/bvn`,
        {
          bvn,
          ...options
        },
        {
          headers: this.getHeaders()
        }
      );

      return {
        success: true,
        data: this.formatBVNResponse(response.data)
      };
    } catch (error) {
      console.error('Dojah BVN verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'BVN verification failed'
      };
    }
  }

  async verifyNIN(nin, options = {}) {
    try {
      const response = await axios.post(
        `${DOJAH_BASE_URL}/kyc/nin`,
        {
          nin,
          ...options
        },
        {
          headers: this.getHeaders()
        }
      );

      return {
        success: true,
        data: this.formatNINResponse(response.data)
      };
    } catch (error) {
      console.error('Dojah NIN verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'NIN verification failed'
      };
    }
  }

  async verifyDocument(image, type = 'passport') {
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('type', type);

      const response = await axios.post(
        `${DOJAH_BASE_URL}/kyc/document`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Dojah document verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Document verification failed'
      };
    }
  }

  async verifySelfie(image, nin) {
    try {
      const formData = new FormData();
      formData.append('selfie_image', image);
      formData.append('nin', nin);

      const response = await axios.post(
        `${DOJAH_BASE_URL}/kyc/selfie`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Dojah selfie verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Selfie verification failed'
      };
    }
  }

  getHeaders() {
    return {
      'AppId': this.appId,
      'Authorization': this.secretKey,
      'Content-Type': 'application/json'
    };
  }

  formatBVNResponse(data) {
    return {
      firstName: data.entity?.first_name || data.first_name,
      lastName: data.entity?.last_name || data.last_name,
      middleName: data.entity?.middle_name || data.middle_name,
      dateOfBirth: data.entity?.date_of_birth || data.date_of_birth,
      phone: data.entity?.phone_number || data.phone_number,
      gender: data.entity?.gender || data.gender,
      photo: data.entity?.photo || data.photo,
      status: data.entity?.status || data.status
    };
  }

  formatNINResponse(data) {
    return {
      firstName: data.entity?.first_name,
      lastName: data.entity?.last_name,
      middleName: data.entity?.middle_name,
      dateOfBirth: data.entity?.date_of_birth,
      phone: data.entity?.phone_number,
      gender: data.entity?.gender,
      photo: data.entity?.photo,
      address: data.entity?.address,
      state: data.entity?.state,
      status: data.entity?.status
    };
  }
}

export const dojahService = new DojahService();