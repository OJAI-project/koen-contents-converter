document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const audioFileInput = document.getElementById('audioFile');
    const convertBtn = document.getElementById('convertBtn');
    const translateBtn = document.getElementById('translateBtn');
    const enhanceBtn = document.getElementById('enhanceBtn');
    const generateAudioBtn = document.getElementById('generateAudioBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultText = document.getElementById('resultText');
    const translatedText = document.getElementById('translatedText');
    const enhancedText = document.getElementById('enhancedText');
    const audioContainer = document.getElementById('audioContainer');
    const audioPlayer = document.getElementById('audioPlayer');

    // Initialize variables
    let selectedFile = null;
    let currentAudioUrl = null;

    // File selection handler
    audioFileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            convertBtn.disabled = false;
        }
    });

    // Convert button handler
    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showError('Please select an audio file.');
            return;
        }

        try {
            convertBtn.disabled = true;
            translateBtn.disabled = true;
            enhanceBtn.disabled = true;
            generateAudioBtn.disabled = true;
            convertBtn.textContent = 'Converting...';
            resultText.value = 'Converting speech to text...';
            resultText.disabled = true;
            translatedText.value = '';
            enhancedText.value = '';
            audioContainer.classList.remove('show');

            const formData = new FormData();
            formData.append('file', selectedFile);

            // Log the file details for debugging
            console.log('File being uploaded:', {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size
            });

            // Use the full path for the API endpoint
            const apiUrl = window.location.origin + '/api/convert';
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            // Log the response status and headers for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.details || `Server error: ${response.status}`);
                } catch (e) {
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }
            }

            const responseText = await response.text();
            console.log('Response text:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid JSON response from server');
            }

            resultText.value = data.text;
            resultText.disabled = false;
            translateBtn.disabled = false;
            resultText.focus();
            resultText.setSelectionRange(0, 0);

        } catch (error) {
            showError(`Error occurred: ${error.message}`);
            resultText.value = '';
            resultText.disabled = false;
            translateBtn.disabled = true;
            enhanceBtn.disabled = true;
            generateAudioBtn.disabled = true;
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert';
            selectedFile = null;
            audioFileInput.value = '';
        }
    });

    // Translate button handler
    translateBtn.addEventListener('click', async () => {
        const koreanText = resultText.value.trim();
        if (!koreanText) {
            showError('Please provide Korean text to translate.');
            return;
        }

        try {
            translateBtn.disabled = true;
            enhanceBtn.disabled = true;
            generateAudioBtn.disabled = true;
            translateBtn.textContent = 'Translating...';
            translatedText.value = 'Translating...';
            translatedText.disabled = true;
            enhancedText.value = '';
            audioContainer.classList.remove('show');

            const apiUrl = window.location.origin + '/api/translate';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: koreanText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `Server error: ${response.status}`);
            }

            const data = await response.json();
            translatedText.value = data.translation;
            translatedText.disabled = false;
            enhanceBtn.disabled = false;
            translatedText.focus();
            translatedText.setSelectionRange(0, 0);

        } catch (error) {
            showError(`Translation error: ${error.message}`);
            translatedText.value = '';
            enhanceBtn.disabled = true;
            generateAudioBtn.disabled = true;
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = 'Translate to English';
            translatedText.disabled = false;
        }
    });

    // Enhance button handler
    enhanceBtn.addEventListener('click', async () => {
        const englishText = translatedText.value.trim();
        if (!englishText) {
            showError('Please provide English text to enhance.');
            return;
        }

        try {
            enhanceBtn.disabled = true;
            generateAudioBtn.disabled = true;
            enhanceBtn.textContent = 'Enhancing...';
            enhancedText.value = 'Enhancing text for YouTube...';
            enhancedText.disabled = true;
            audioContainer.classList.remove('show');

            const apiUrl = window.location.origin + '/api/enhance';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: englishText })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `Server error: ${response.status}`);
            }

            const data = await response.json();
            enhancedText.value = data.enhanced;
            enhancedText.disabled = false;
            generateAudioBtn.disabled = false;
            enhancedText.focus();
            enhancedText.setSelectionRange(0, 0);

        } catch (error) {
            showError(`Enhancement error: ${error.message}`);
            enhancedText.value = '';
            generateAudioBtn.disabled = true;
        } finally {
            enhanceBtn.disabled = false;
            enhanceBtn.textContent = 'Enhance for YouTube';
            enhancedText.disabled = false;
        }
    });

    // Generate Audio button handler
    generateAudioBtn.addEventListener('click', async () => {
        const text = enhancedText.value.trim();
        if (!text) {
            showError('Please provide text to convert to speech.');
            return;
        }

        try {
            generateAudioBtn.disabled = true;
            generateAudioBtn.textContent = 'Generating Audio...';
            audioContainer.classList.remove('show');

            const selectedVoice = document.querySelector('input[name="voice"]:checked').value;

            const apiUrl = window.location.origin + '/api/tts';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    voice: selectedVoice
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `Server error: ${response.status}`);
            }

            // Handle binary audio data
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            audioPlayer.src = audioUrl;
            audioContainer.classList.add('show');

            // Set up download functionality
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = audioUrl;
                link.download = `tts-${Date.now()}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

        } catch (error) {
            showError(`Audio generation error: ${error.message}`);
            audioContainer.classList.remove('show');
        } finally {
            generateAudioBtn.disabled = false;
            generateAudioBtn.textContent = 'Generate Audio';
        }
    });

    // Textarea click handlers
    resultText.addEventListener('click', () => {
        if (resultText.value && resultText.value !== 'Converting speech to text...') {
            resultText.disabled = false;
        }
    });

    translatedText.addEventListener('click', () => {
        if (translatedText.value && translatedText.value !== 'Translating...') {
            translatedText.disabled = false;
        }
    });

    enhancedText.addEventListener('click', () => {
        if (enhancedText.value && enhancedText.value !== 'Enhancing text for YouTube...') {
            enhancedText.disabled = false;
        }
    });

    // Error display function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;

        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }

        convertBtn.parentNode.insertBefore(errorDiv, convertBtn.nextSibling);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Initialize states
    resultText.disabled = false;
    translatedText.disabled = false;
    enhancedText.disabled = false;
    convertBtn.disabled = true;
    translateBtn.disabled = true;
    enhanceBtn.disabled = true;
    generateAudioBtn.disabled = true;
    audioContainer.classList.remove('show');
});