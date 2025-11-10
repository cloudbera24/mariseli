import { storage, File } from 'megajs';

// Use environment variables for credentials (recommended)
const auth = {
    email: process.env.MEGA_EMAIL || 'permaunban@gmail.com',
    password: process.env.MEGA_PASSWORD || 'umar165123719.',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

// Initialize Mega storage once and reuse it
let megaStorage = null;

async function initializeStorage() {
    if (megaStorage) return megaStorage;
    
    return new Promise((resolve, reject) => {
        try {
            megaStorage = new storage(auth, (error) => {
                if (error) {
                    console.error('Mega storage initialization failed:', error);
                    reject(error);
                } else {
                    console.log('Mega storage initialized successfully');
                    resolve(megaStorage);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

export const upload = async (stream, filename) => {
    try {
        const storage = await initializeStorage();
        
        return new Promise((resolve, reject) => {
            try {
                const file = storage.upload({
                    name: filename,
                    allowUploadBuffering: true
                });

                stream.pipe(file);

                file.on('complete', () => {
                    file.link((error, url) => {
                        if (error) {
                            reject(error);
                        } else {
                            storage.close();
                            resolve(url);
                        }
                    });
                });

                file.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

export const download = async (url) => {
    try {
        return new Promise((resolve, reject) => {
            File.fromURL(url).loadAttributes((error, file) => {
                if (error) {
                    reject(error);
                    return;
                }

                file.downloadBuffer((error, buffer) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(buffer);
                    }
                });
            });
        });
    } catch (error) {
        throw new Error(`Download failed: ${error.message}`);
    }
};
