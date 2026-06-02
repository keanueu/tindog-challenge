 
        (function () {
            const sticky = document.getElementById('sticky-nav');
            const findOut = document.querySelector('.find-out');

            if (!sticky || !findOut) return;

            // ensure starting hidden state (opacity/transform keep it visually out)
            sticky.style.visibility = 'hidden';

            const toleranceTop = 10; // px before findOut top

            function showSticky() {
                if (sticky.classList.contains('visible')) return;
                // make visible immediately then animate in
                sticky.style.visibility = 'visible';
                sticky.classList.add('visible');
                sticky.setAttribute('aria-hidden', 'false');
            }

            function hideSticky() {
                if (!sticky.classList.contains('visible')) return;
                // animate out then hide via transitionend
                sticky.classList.remove('visible');
                sticky.setAttribute('aria-hidden', 'true');
                const onEnd = (e) => {
                    if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                        sticky.style.visibility = 'hidden';
                        sticky.removeEventListener('transitionend', onEnd);
                    }
                };
                sticky.addEventListener('transitionend', onEnd);
            }

            function checkSticky() {
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                const findTop = findOut.offsetTop;
                const enteredFind = (scrollY + 1) >= (findTop - toleranceTop);

                if (enteredFind) showSticky(); else hideSticky();
            }

            window.addEventListener('scroll', checkSticky, { passive: true });
            window.addEventListener('resize', checkSticky);

            // initial check
            setTimeout(checkSticky, 50);
        })();
    