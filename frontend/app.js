document.addEventListener('DOMContentLoaded', () => {
    // ... (keep all the variable declarations and event listeners the same until the fetch calls)

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

    // Update other API calls similarly
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

    // Keep the rest of the code (textarea event listeners, showError function, and state initialization) the same
});