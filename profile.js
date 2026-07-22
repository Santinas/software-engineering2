async function getFreelancer() {
    const supabase = await getSupabase();
    const userEmail = localStorage.getItem("userEmail");
    const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .eq('email', userEmail)
        .limit(1);
    return data[0];    
}

function parseCourseYear(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/^(.*?)\s*\(\s*(.*?)\s*\)\s*$/);
  if (!match) {
    return { course: trimmed, year: null };
  }

  return {
    course: match[1],
    year: match[2],
  };
}

async function populateProfile(){
    const freelancer = await getFreelancer();
    const userSkills = freelancer.skills;
    const skillList = document.getElementsByClassName('skill-pick');
    const program = parseCourseYear(freelancer.program);
    const gitPortfolio = JSON.parse(freelancer.portfolio);
    let portfolioUrl = null;
    if(gitPortfolio[0].toString().startsWith('http')){
        portfolioUrl = gitPortfolio[0].toString();
    }
    
    document.getElementById('signup-first-name').value = freelancer.first_name;
    document.getElementById('signup-last-name').value = freelancer.last_name;
    document.getElementById('signup-email').value = freelancer.email;
    document.getElementById('signup-program').value = program.course;
    document.getElementById('signup-year').value = program.year;
    document.getElementById('signup-headline').value = freelancer.headline;
    document.getElementById('signup-bio').value = freelancer.bio;
    document.getElementById('signup-rate').value = freelancer.rate;
    document.getElementById('signup-mobile').value = freelancer.mobile;
    document.getElementById('signup-location').value = freelancer.location;
    document.getElementById('signup-linkedin').value = freelancer.linkedin;
    document.getElementById('signup-portfolio').value = portfolioUrl;
    
    //select existing skills
    for(const userSkill of userSkills){
        for(const skill of skillList){
            if(userSkill == skill.innerText){
                skill.classList.add("chosen");
            }
        }    
    }
}

window.updateProfile = async function(event) {
    event.preventDefault();
    try {
        const submitBtn = document.getElementById('edit-submit-btn');
        if (!submitBtn) return;
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Profile...';

        const firstName = document.getElementById('signup-first-name').value.trim();
        const lastName = document.getElementById('signup-last-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const program = document.getElementById('signup-program').value;
        const year = document.getElementById('signup-year').value;
        const headline = document.getElementById('signup-headline').value.trim();
        const bio = document.getElementById('signup-bio').value.trim();
        const rate = document.getElementById('signup-rate').value;
        const mobile = document.getElementById('signup-mobile').value.trim();
        const location = document.getElementById('signup-location').value.trim();
        const linkedin = document.getElementById('signup-linkedin').value.trim();
        const portfolio = document.getElementById('signup-portfolio').value.trim();

        if (!firstName || !lastName || !email || !program || !year || !headline || !bio || !rate || !mobile || !location) {
            alert('Please fill in all required fields.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(rate) || parseFloat(rate) <= 0) {
            alert('Please enter a valid starting rate (a number greater than 0).');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        // Get selected skills
        const selectedSkills = [];
        document.querySelectorAll('#signup-skills-picker .skill-pick.chosen').forEach(el => {
            selectedSkills.push(el.textContent.trim());
        });

        // Build portfolio array: start with direct link if provided, followed by uploaded files
        const portfolioUrls = [];
        if (portfolio) {
            portfolioUrls.push(portfolio);
        }
        uploadedPortfolioFiles.forEach(f => {
            portfolioUrls.push(f.dataUrl);
        });

        // The database only accepts profiles created under the student's own
        // login email, so prefer the verified account email over the form field
        const accountEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
        const profileData = {
            first_name: firstName,
            last_name: lastName,
            email: accountEmail || email,
            program: `${program} (${year})`,
            headline: headline,
            bio: bio,
            skills: selectedSkills,
            rate: parseFloat(rate),
            mobile: mobile,
            location: location,
            linkedin: linkedin || null,
            portfolio: JSON.stringify(portfolioUrls) // Column is plain text, so store as a JSON string
        };
        const supabase = await getSupabase();
        // Save to Supabase
        let supabaseSuccess = false;
        let saveErrorDetail = '';
        // TEMP DIAGNOSTIC: find out which login session the browser actually has.
        // The update policy only allows the write if this session email matches
        // the profile row's email.
        let sessionEmail = '(no session)';
        try {
            const { data: userData } = await supabase.auth.getUser();
            sessionEmail = userData?.user?.email || '(no session)';
        } catch (e) { /* ignore */ }
        console.log('DIAGNOSTIC — logged-in session email:', sessionEmail,
                    '| updating row where email =', accountEmail);
        try {
            // Pass a plain object (not an array), and .select() so Supabase
            // returns the changed rows — an empty result means RLS silently
            // blocked the update (run supabase-security-policies.sql to add
            // the freelancers update policy).
            const { data, error } = await supabase
            .from('freelancers')
            .update(profileData)
            .eq('email', accountEmail)
            .select();
            if (error) throw error;
            if (!data || !data.length) {
                throw new Error('0 rows changed — either RLS blocked it (logged-in email "' + sessionEmail + '" must equal the profile email "' + accountEmail + '"), or no row matches that email.');
            }
            supabaseSuccess = true;
            console.log('Freelancer profile saved successfully to Supabase:', data);


        } catch (supabaseErr) {
            saveErrorDetail = supabaseErr?.message || String(supabaseErr);
            console.warn('Failed to update Supabase freelancers table.', supabaseErr);
        }

        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { 'Display name': `${firstName} ${lastName}` }
            })
        }  catch (supabaseErr) {
            console.warn('Failed to update user profile.', supabaseErr);
        }
        
        
    //   // Always save to localStorage as fallback
    //   const localFreelancers = JSON.parse(localStorage.getItem('localFreelancers') || '[]');
    //   localFreelancers.push(profileData);
    //   localStorage.setItem('localFreelancers', JSON.stringify(localFreelancers));

        if (!supabaseSuccess) {
            alert('Your profile could not be updated.\n\nReason: ' + (saveErrorDetail || 'unknown') + '\n\nLogged-in as: ' + sessionEmail + '\nProfile email: ' + accountEmail);
            return;
        }

        // Reset uploaded files state
        uploadedPortfolioFiles = [];

        alert('Success! Your profile has been updated and is now live on the marketplace!');
        window.location.href = 'find-talent.html';
    } catch (err) {
        console.error('Error submitting profile:', err);
        alert('An unexpected error occurred. Please try again.');
    } finally {
        const submitBtn = document.getElementById('edit-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    populateProfile()
});