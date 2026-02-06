// Audio soundscape for The Parrot's Tale
// Four stages: Palace → Docks (3s) → Sea (5s) → Palace Quiet (5s)

(function() {
    // Create audio elements
    const palace = new Audio('parrot-palace.mp3');
    const docks = new Audio('parrot-docks.mp3');
    const sea = new Audio('parrot-sea.mp3');
    
    // Configure all tracks
    [palace, docks, sea].forEach(audio => {
        audio.loop = true;
        audio.volume = 0;
        audio.preload = 'auto';
    });
    
    let currentTrack = null;
    let isTransitioning = false;
    
    // Crossfade function
    function crossfade(fromTrack, toTrack, duration, toVolume = 0.6) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        const steps = 60; // 60 steps for smooth fade
        const stepDuration = (duration * 1000) / steps;
        const fromVolumeDelta = fromTrack ? fromTrack.volume / steps : 0;
        const toVolumeDelta = toVolume / steps;
        
        let step = 0;
        
        // Start the new track if it's not playing
        if (toTrack.paused) {
            toTrack.currentTime = 0;
            toTrack.play().catch(e => console.log('Audio play prevented:', e));
        }
        
        const interval = setInterval(() => {
            step++;
            
            // Fade out old track
            if (fromTrack && fromTrack.volume > 0) {
                fromTrack.volume = Math.max(0, fromTrack.volume - fromVolumeDelta);
            }
            
            // Fade in new track
            if (toTrack.volume < toVolume) {
                toTrack.volume = Math.min(toVolume, toTrack.volume + toVolumeDelta);
            }
            
            if (step >= steps) {
                clearInterval(interval);
                if (fromTrack) {
                    fromTrack.pause();
                    fromTrack.volume = 0;
                }
                toTrack.volume = toVolume;
                currentTrack = toTrack;
                isTransitioning = false;
            }
        }, stepDuration);
    }
    
    // Set up intersection observers for each transition point
    
    // TRANSITION 1: Palace → Docks
    // Trigger: "And then we were outside" paragraph
    const docksTransition = document.querySelector('#docks-transition');
    if (docksTransition) {
        const docksObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentTrack !== docks) {
                    console.log('Transitioning to docks (3s)');
                    crossfade(currentTrack, docks, 3, 0.6);
                }
            });
        }, { threshold: 0.5 });
        
        docksObserver.observe(docksTransition);
    }
    
    // TRANSITION 2: Docks → Sea
    // Trigger: "We went below" paragraph
    const seaTransition = document.querySelector('#sea-transition');
    if (seaTransition) {
        const seaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentTrack !== sea) {
                    console.log('Transitioning to sea (5s)');
                    crossfade(currentTrack, sea, 5, 0.6);
                }
            });
        }, { threshold: 0.5 });
        
        seaObserver.observe(seaTransition);
    }
    
    // TRANSITION 3: Sea → Palace (quiet)
    // Trigger: "Later—much later—I made my way up to the deck"
    const palaceReturnTransition = document.querySelector('#palace-return-transition');
    if (palaceReturnTransition) {
        const palaceReturnObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentTrack !== palace) {
                    console.log('Transitioning to palace (quiet, 5s)');
                    crossfade(currentTrack, palace, 5, 0.3); // Lower volume for return
                }
            });
        }, { threshold: 0.5 });
        
        palaceReturnObserver.observe(palaceReturnTransition);
    }
    
    // Auto-start palace music when user first interacts with page
    let hasStarted = false;
    function startAudio() {
        if (!hasStarted) {
            hasStarted = true;
            console.log('Starting palace music');
            palace.play().catch(e => console.log('Audio play prevented:', e));
            crossfade(null, palace, 2, 0.6);
            
            // Remove listeners after first interaction
            document.removeEventListener('click', startAudio);
            document.removeEventListener('scroll', startAudio);
            document.removeEventListener('touchstart', startAudio);
        }
    }
    
    document.addEventListener('click', startAudio);
    document.addEventListener('scroll', startAudio);
    document.addEventListener('touchstart', startAudio);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        [palace, docks, sea].forEach(audio => {
            audio.pause();
            audio.src = '';
        });
    });
})();
