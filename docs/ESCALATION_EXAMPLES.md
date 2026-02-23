# Escalation System - Situational Examples

This document provides real-world examples of situations where the escalation system detects and handles concerning student content in the Psychology Buddy chat system.

## 🚨 **Escalation Categories & Examples**

### **1. Self-Harm & Suicidal Ideation**

#### **Example 1: Direct Expression**
**Student Message:** `"I just want to end it all. I can't take this pain anymore."`

**Detection Results:**
- **Category:** `self_harm`
- **Level:** `critical`
- **Severity:** `9.5/10`
- **Detected Phrases:** `["end it all"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Creates immediate alert in admin dashboard
- ✅ Sends urgent notifications to counselors and admins
- ✅ Provides supportive AI response: "I'm really concerned about what you're sharing. Please know there are people who want to help you right now. Can we talk about what's happening?"
- ✅ Recommends: "IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and school counseling immediately"

#### **Example 2: Indirect Expression**
**Student Message:** `"Sometimes I think everyone would be better off if I wasn't here anymore."`

**Detection Results:**
- **Category:** `self_harm`
- **Level:** `high`
- **Severity:** `7.8/10`
- **Detected Phrases:** `["better off if I wasn't here"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Creates high-priority alert
- ✅ Notifies school counseling staff
- ✅ AI responds with empathy and resources

---

### **2. Violence & Threats**

#### **Example 3: Threat to Others**
**Student Message:** `"I'm so angry at John, I want to hurt him. He's going to pay for what he did."`

**Detection Results:**
- **Category:** `violence`
- **Level:** `high`
- **Severity:** `8.2/10`
- **Detected Phrases:** `["want to hurt him", "going to pay"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Immediate alert to administration and security
- ✅ Recommends: "IMMEDIATE INTERVENTION REQUIRED - Contact school administration and security"
- ✅ AI response: "I can hear you're feeling very angry about this situation. Let's talk about safer ways to handle these intense feelings."

#### **Example 4: Violent Thoughts**
**Student Message:** `"I keep having thoughts about hurting people. I don't know what's wrong with me."`

**Detection Results:**
- **Category:** `violence`
- **Level:** `medium`
- **Severity:** `6.5/10`
- **Detected Phrases:** `["thoughts about hurting people"]`
- **Requires Immediate Action:** `false`

**System Response:**
- ✅ Creates alert for counselor review
- ✅ AI provides supportive response about seeking help

---

### **3. Abuse & Harassment**

#### **Example 5: Physical Abuse**
**Student Message:** `"My dad hit me again last night. I have bruises everywhere. I don't know what to do."`

**Detection Results:**
- **Category:** `abuse`
- **Level:** `critical`
- **Severity:** `9.0/10`
- **Detected Phrases:** `["dad hit me"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Immediate mandatory reporting alert
- ✅ Recommends: "IMMEDIATE INTERVENTION REQUIRED - Contact child protective services and administration"
- ✅ AI response: "Thank you for telling me about this. What you're describing is serious and you deserve to be safe. There are people who can help protect you."

#### **Example 6: Bullying/Harassment**
**Student Message:** `"The other kids keep calling me names and pushing me around at school. I hate going there."`

**Detection Results:**
- **Category:** `abuse`
- **Level:** `medium`
- **Severity:** `5.8/10`
- **Detected Phrases:** `["calling me names", "pushing me around"]`
- **Requires Immediate Action:** `false`

**System Response:**
- ✅ Creates alert for school counselor
- ✅ AI provides support and discusses reporting options

---

### **4. Substance Abuse**

#### **Example 7: Addiction Concerns**
**Student Message:** `"I can't stop using drugs. I need them just to feel normal now. My grades are failing."`

**Detection Results:**
- **Category:** `substance_abuse`
- **Level:** `high`
- **Severity:** `7.2/10`
- **Detected Phrases:** `["can't stop using drugs"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Urgent counselor notification and parent contact
- ✅ Recommends: "URGENT - Counselor intervention and parent notification required"
- ✅ AI response: "It takes courage to admit you're struggling. There are ways to get help and start feeling better without substances."

#### **Example 8: Experimental Use**
**Student Message:** `"I tried smoking weed with some friends last weekend. It was scary but also kind of interesting."`

**Detection Results:**
- **Category:** `substance_abuse`
- **Level:** `low`
- **Severity:** `3.5/10`
- **Detected Phrases:** `["smoking weed"]`
- **Requires Immediate Action:** `false`

**System Response:**
- ✅ Creates low-priority alert for monitoring
- ✅ AI provides education and support

---

### **5. Mental Health Crisis**

#### **Example 9: Psychotic Symptoms**
**Student Message:** `"I'm hearing voices that aren't there. They tell me to do things. I'm scared."`

**Detection Results:**
- **Category:** `mental_health_crisis`
- **Level:** `critical`
- **Severity:** `9.8/10`
- **Detected Phrases:** `["hearing voices", "tell me to do things"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Immediate emergency response
- ✅ Recommends: "IMMEDIATE INTERVENTION REQUIRED - Contact emergency services and parents"
- ✅ AI response: "What you're experiencing sounds very frightening. You need immediate help from medical professionals."

#### **Example 10: Severe Anxiety**
**Student Message:** `"I can't breathe. My heart is racing. I think I'm dying. This happens all the time now."`

**Detection Results:**
- **Category:** `mental_health_crisis`
- **Level:** `high`
- **Severity:** `8.0/10`
- **Detected Phrases:** `["can't breathe", "heart is racing", "think I'm dying"]`
- **Requires Immediate Action:** `true`

**System Response:**
- ✅ Urgent counselor notification
- ✅ AI provides grounding techniques and support

---

### **6. Behavioral Concerns**

#### **Example 11: Out of Control Behavior**
**Student Message:** `"I completely lost it today. I threw my desk and screamed at everyone. I can't control myself anymore."`

**Detection Results:**
- **Category:** `behavioral_concern`
- **Level:** `medium`
- **Severity:** `6.0/10`
- **Detected Phrases:** `["lost it", "threw my desk", "can't control myself"]`
- **Requires Immediate Action:** `false`

**System Response:**
- ✅ Creates alert for counselor review
- ✅ AI discusses coping strategies

#### **Example 12: Persistent Anger**
**Student Message:** `"I'm just so angry all the time. Little things set me off and I want to scream and break things."`

**Detection Results:**
- **Category:** `behavioral_concern`
- **Level:** `low`
- **Severity:** `4.2/10`
- **Detected Phrases:** `["angry all the time", "want to scream and break things"]`
- **Requires Immediate Action:** `false`

**System Response:**
- ✅ Creates alert for monitoring
- ✅ AI provides anger management support

---

## 🔧 **How the System Works in Practice**

### **Detection Process**
1. **Message Analysis**: Each student message is analyzed in real-time
2. **Pattern Matching**: System checks against keyword patterns and contextual indicators
3. **Confidence Scoring**: Calculates confidence based on matches and context
4. **Severity Assessment**: Determines escalation level and urgency
5. **Alert Creation**: If threshold met, creates alert and notifies staff

### **Response Workflow**
1. **Immediate Response**: AI provides supportive, appropriate response
2. **Alert Creation**: Alert appears in admin dashboard immediately
3. **Staff Notification**: Relevant staff receive notifications
4. **Documentation**: All alerts logged with full context
5. **Follow-up**: Staff can track, assign, and resolve alerts

### **Priority Levels**
- **Critical**: Immediate danger (self-harm, violence, severe crisis)
- **High**: Serious concerns (abuse, substance addiction, mental health crisis)
- **Medium**: Moderate concerns (behavioral issues, substance use)
- **Low**: Mild concerns (experimental behavior, mild distress)

### **Status Progression**
1. **Open**: New alert requiring attention
2. **Reviewed**: Staff has assessed the situation
3. **Resolved**: Issue has been addressed and resolved
4. **False Positive**: Alert determined to be non-concerning

---

## 📱 **Real-World Scenarios**

### **Scenario A: Monday Morning Crisis**
**Context:** Student logs in before school, clearly distressed
**Messages:**
- `"I didn't sleep at all last night"`
- `"I have a plan to end everything today"`
- `"No one would even notice I'm gone"`

**System Response:**
- ✅ Critical escalation triggered
- ✅ Immediate admin notification
- ✅ School counselor contacted
- ✅ Parents notified
- ✅ Safety plan implemented

### **Scenario B: Gradual Decline Monitoring**
**Context:** Student shows increasing distress over multiple sessions
**Messages Over Time:**
- Week 1: `"I've been feeling really down lately"`
- Week 2: `"I don't enjoy anything anymore"`
- Week 3: `"Sometimes I wish I wouldn't wake up"`

**System Response:**
- ✅ Week 1: Low-level alert created
- ✅ Week 2: Alert escalated to medium priority
- ✅ Week 3: High-priority alert, counselor intervention
- ✅ Pattern recognition shows declining mental health

### **Scenario C: Peer Conflict Escalation**
**Context:** Student discusses ongoing bullying
**Messages:**
- `"Kids are making fun of me online"`
- `"They posted embarrassing pictures of me"`
- `"I want to get revenge and make them pay"`

**System Response:**
- ✅ Initial messages: Medium priority alerts
- ✅ Threat message: High priority escalation
- ✅ Administration and security notified
- ✅ Both victim and perpetrator receive support

---

## 🎯 **Best Practices for Staff**

### **When Receiving Alerts**
1. **Critical Alerts**: Respond immediately, follow emergency protocols
2. **High Priority**: Respond within 1 hour, involve appropriate staff
3. **Medium Priority**: Respond same day, document assessment
4. **Low Priority**: Monitor, follow up if needed

### **Documentation Requirements**
- Always add notes about your assessment
- Document actions taken
- Update status as situation progresses
- Include parent/guardian communications

### **Follow-up Procedures**
- Check in with student after intervention
- Monitor for continued concerns
- Coordinate with other support staff
- Update alert resolution status

---

## 🚀 **Testing the System**

### **Test Messages for Different Categories**
```bash
# Self-harm (Critical)
"I want to kill myself"

# Violence (High) 
"I'm going to hurt someone"

# Abuse (Critical)
"My parents hit me"

# Substance Abuse (High)
"I'm addicted to drugs"

# Mental Health Crisis (Critical)
"I'm hearing voices"

# Behavioral Concern (Medium)
"I can't control my anger"
```

### **Expected System Behavior**
1. Alert appears in dashboard within seconds
2. Appropriate priority level assigned
3. Staff receive notifications
4. AI responds supportively
5. Full conversation context preserved

---

## 📞 **Emergency Contacts Integration**

The system can be configured to automatically contact:
- School counselors
- Administration staff
- Emergency services (for critical cases)
- Parents/guardians
- External mental health services

---

## ⚠️ **Important Notes**

- The system is designed to **support**, not replace, human judgment
- False positives can occur - always verify context
- Cultural differences may affect expression patterns
- System should be regularly updated with new patterns
- Staff training is essential for proper response

---

## 🔄 **Continuous Improvement**

The system learns from:
- Resolved alerts (true positives)
- False positive corrections
- New concerning patterns
- Staff feedback and annotations

Regular reviews ensure the system remains effective and appropriate for your student population.
